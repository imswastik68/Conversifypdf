import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { Editor } from '@tiptap/react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useAction, useMutation } from 'convex/react';
import { Bold, Code, Highlighter, Italic, Sparkle, Underline, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

function EditorExtensions({ editor }: { editor: Editor }) {
  const { fileId } = useParams();
  if (typeof fileId !== 'string') {
    throw new Error('fileId must be a string');
  }
  const SearchAI = useAction(api.myActions.search);
  const saveNotes = useMutation(api.notes.AddNotes);
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle Enter key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Enter is pressed without Shift
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); // Prevent default newline behavior
        
        // Get the current line's text
        const { from, to } = editor.state.selection;
        const lineText = editor.state.doc.textBetween(from, to);
        
        // If the line starts with "?" or "!", process it as an AI query
        if (lineText.trim().startsWith('?') || lineText.trim().startsWith('!')) {
          processAiQuery(lineText.trim().substring(1));
        }
      }
    };

    if (editor) {
      editor.view.dom.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (editor) {
        editor.view.dom.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [editor]);

  const processAiQuery = async (query: string) => {
    setIsProcessing(true);
    toast("AI is finding your answer...");
    
    try {
      const result = await SearchAI({
        query: query,
        fileId: fileId
      });

      const UnformattedAns = JSON.parse(result);
      let AllUnformattedAns = '';
      if (UnformattedAns) {
        UnformattedAns.forEach((item: { pageContent: string }) => {
          AllUnformattedAns += item.pageContent;
        });
      }

      // Clean the query of any meta-instructions
      const cleanQuery = query.replace(/^(explain it with example|show me an example|give me an example|provide an example)$/i, "Please provide an example of edit distance");
      
      const PROMPT = "For question: " + cleanQuery + 
        "\n\nWith the given context: " + AllUnformattedAns + 
        "\n\nPlease provide a clear, well-structured answer. Format your response with:" + 
        "\n- Clear headers for different sections" + 
        "\n- Use numbered lists where appropriate" + 
        "\n- Include proper spacing for readability" + 
        "\n- Always include at least one complete example to illustrate the concept" + 
        "\n- Make sure to lay out step-by-step explanations for algorithms" + 
        "\n- Ensure tables and structured data are clearly formatted";

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: PROMPT }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate response');
      }

      const data = await response.json();
      
      // Clean up the response to remove any meta text
      let plainTextAnswer = data.text;
      plainTextAnswer = plainTextAnswer.replace(/^(Okay, I understand\.|I will answer your question directly and concisely|Using plain text|Including an example if it helps clarify the answer\.).*/i, "");
      plainTextAnswer = plainTextAnswer.trim();

      // Convert the plain text to HTML with proper formatting
      // This preserves formatting like lists, line breaks, etc.
      const formattedAnswer = convertTextToHTML(plainTextAnswer);

      // Insert the styled answer after the current line
      const { from, to } = editor.state.selection;
      
      // First, remove the query line
      const transaction = editor.state.tr.delete(from, to);
      editor.view.dispatch(transaction);
      
      // Create container for the Q&A
      const qaContainer = `
<div style="margin: 1.5rem 0; border-radius: 0.5rem; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); border: 1px solid #e5e7eb;">
  <div style="padding: 1rem; background-color: #f8fafc; border-bottom: 1px solid #e5e7eb;">
    <div style="display: inline-block; padding: 0.25rem 0.5rem; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; border-radius: 0.25rem; background-color: #e0e7ff; color: #4338ca;">
      Question
    </div>
    <div style="font-size: 0.95rem; line-height: 1.5;">
      ${query}
    </div>
  </div>
  <div style="padding: 1rem; background-color: #ffffff;">
    <div style="display: inline-block; padding: 0.25rem 0.5rem; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; border-radius: 0.25rem; background-color: #dcfce7; color: #166534;">
      Answer
    </div>
    <div style="font-size: 0.95rem; line-height: 1.7; white-space: pre-wrap;">
      ${formattedAnswer}
    </div>
  </div>
</div>
`;

      // Insert the formatted content
      editor.commands.insertContent(qaContainer);

      // Save the updated content
      saveNotes({
        notes: editor.getHTML(),
        fileId: fileId,
        createdBy: user?.primaryEmailAddress?.emailAddress || ''
      });

      toast.success("Answer generated successfully");
    } catch (error) {
      console.error("Error generating AI response:", error);
      if (error instanceof Error) {
        toast.error(`AI Error: ${error.message}`);
      } else {
        toast.error("Failed to generate AI response");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to convert plain text to properly formatted HTML
  const convertTextToHTML = (text: string) => {
    if (!text) return '';

    // Process Markdown-like headers (# Header)
    text = text.replace(/^# (.*$)/gm, '<h1 style="font-size: 1.5rem; font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.75rem;">$1</h1>');
    text = text.replace(/^## (.*$)/gm, '<h2 style="font-size: 1.3rem; font-weight: bold; margin-top: 1.25rem; margin-bottom: 0.75rem;">$1</h2>');
    text = text.replace(/^### (.*$)/gm, '<h3 style="font-size: 1.15rem; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem;">$1</h3>');
    
    // Process code blocks (surrounded by backticks)
    text = text.replace(/```([\s\S]*?)```/g, '<pre style="background-color: #f1f5f9; padding: 0.75rem; margin: 0.75rem 0; border-radius: 0.375rem; overflow-x: auto; font-family: monospace;">$1</pre>');
    
    // Process inline code
    text = text.replace(/`([^`]+)`/g, '<code style="background-color: #f1f5f9; padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-family: monospace;">$1</code>');
    
    // Process numbered lists
    let listMatch = text.match(/^(\d+\. .*(?:\n(?!\d+\. )[^\n]*)*\n*)+/gm);
    if (listMatch) {
      listMatch.forEach(list => {
        const items = list.split(/\n(?=\d+\. )/);
        const formattedItems = items.map(item => {
          // Remove the number and dot
          const content = item.replace(/^\d+\. /, '');
          return `<li style="margin-bottom: 0.5rem;">${content.trim()}</li>`;
        });
        const formattedList = `<ol style="list-style-type: decimal; padding-left: 1.5rem; margin: 0.75rem 0;">${formattedItems.join('')}</ol>`;
        text = text.replace(list, formattedList);
      });
    }
    
    // Process bullet lists
    listMatch = text.match(/^(\* .*(?:\n(?!\* )[^\n]*)*\n*)+/gm);
    if (listMatch) {
      listMatch.forEach(list => {
        const items = list.split(/\n(?=\* )/);
        const formattedItems = items.map(item => {
          // Remove the bullet
          const content = item.replace(/^\* /, '');
          return `<li style="margin-bottom: 0.5rem;">${content.trim()}</li>`;
        });
        const formattedList = `<ul style="list-style-type: disc; padding-left: 1.5rem; margin: 0.75rem 0;">${formattedItems.join('')}</ul>`;
        text = text.replace(list, formattedList);
      });
    }
    
    // Process tables
    const tableMatch = text.match(/\|\s*[^|]+\s*\|[\s\S]*?\n(?:\n|$)/g);
    if (tableMatch) {
      tableMatch.forEach(table => {
        const rows = table.trim().split('\n');
        
        // Skip if it doesn't have at least header row and separator
        if (rows.length < 2) return;
        
        let htmlTable = '<table style="border-collapse: collapse; width: 100%; margin: 1rem 0;">';
        
        // Process header row
        const headers = rows[0].split('|').filter(cell => cell.trim() !== '');
        htmlTable += '<thead><tr>';
        headers.forEach(header => {
          htmlTable += `<th style="border: 1px solid #e5e7eb; padding: 0.5rem; text-align: left; background-color: #f1f5f9;">${header.trim()}</th>`;
        });
        htmlTable += '</tr></thead>';
        
        // Skip the separator row (row[1]) and process data rows
        htmlTable += '<tbody>';
        for (let i = 2; i < rows.length; i++) {
          if (rows[i].trim() === '') continue;
          
          const cells = rows[i].split('|').filter(cell => cell.trim() !== '');
          htmlTable += '<tr>';
          cells.forEach(cell => {
            htmlTable += `<td style="border: 1px solid #e5e7eb; padding: 0.5rem;">${cell.trim()}</td>`;
          });
          htmlTable += '</tr>';
        }
        htmlTable += '</tbody></table>';
        
        text = text.replace(table, htmlTable);
      });
    }
    
    // Process paragraphs (double line breaks)
    text = text.replace(/\n\n/g, '</p><p style="margin-bottom: 1rem;">');
    
    // Process single line breaks
    text = text.replace(/\n/g, '<br />');
    
    // Wrap in paragraph tags if not already done
    if (!text.startsWith('<')) {
      text = `<p style="margin-bottom: 1rem;">${text}</p>`;
    }
    
    return text;
  };

  const onAiClick = async () => {
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      " "
    );
    
    if (selectedText.trim() === '') {
      toast.error("Please select or type text to query AI");
      return;
    }
    
    await processAiQuery(selectedText);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
            editor.isActive('bold') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
            editor.isActive('italic') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
            editor.isActive('underline') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'
          }`}
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
            editor.isActive('code') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'
          }`}
          title="Code"
        >
          <Code className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleMark('highlight').run()}
          className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
            editor.isActive('highlight') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'
          }`}
          title="Highlight"
        >
          <Highlighter className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-gray-200 mx-1"></div>

        <button
          onClick={onAiClick}
          disabled={isProcessing}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
            isProcessing 
              ? 'bg-indigo-100 text-indigo-400 cursor-not-allowed' 
              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600'
          }`}
          title="Ask AI"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-medium">Processing...</span>
            </>
          ) : (
            <>
              <Sparkle className="w-4 h-4" />
              <span className="text-xs font-medium">Ask AI</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default EditorExtensions;