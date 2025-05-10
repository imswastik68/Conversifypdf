import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { Editor } from '@tiptap/react';
import { useAction, useMutation } from 'convex/react';
import { Bold, Code, Highlighter, Italic, Sparkle, Underline, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useEffect, useState, useCallback } from 'react';

function EditorExtensions({ editor }: { editor: Editor }) {
  const { fileId } = useParams();
  if (typeof fileId !== 'string') throw new Error('fileId must be a string');

  const SearchAI = useAction(api.myActions.search);
  const saveNotes = useMutation(api.notes.AddNotes);
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);

  const convertTextToHTML = (text: string) => {
    if (!text) return '';

    text = text.replace(/^# (.*$)/gm, '<h1 style="font-size: 1.5rem; font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.75rem;">$1</h1>');
    text = text.replace(/^## (.*$)/gm, '<h2 style="font-size: 1.3rem; font-weight: bold; margin-top: 1.25rem; margin-bottom: 0.75rem;">$1</h2>');
    text = text.replace(/^### (.*$)/gm, '<h3 style="font-size: 1.15rem; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem;">$1</h3>');

    text = text.replace(/```([\s\S]*?)```/g, '<pre style="background-color: #f1f5f9; padding: 0.75rem; margin: 0.75rem 0; border-radius: 0.375rem; overflow-x: auto; font-family: monospace;">$1</pre>');
    text = text.replace(/`([^`]+)`/g, '<code style="background-color: #f1f5f9; padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-family: monospace;">$1</code>');

    let listMatch = text.match(/^(\d+\. .*(?:\n(?!\d+\. )[^\n]*)*\n*)+/gm);
    if (listMatch) {
      listMatch.forEach(list => {
        const items = list.split(/\n(?=\d+\. )/);
        const formattedItems = items.map(item =>
          `<li style="margin-bottom: 0.5rem;">${item.replace(/^\d+\. /, '').trim()}</li>`
        );
        text = text.replace(list, `<ol style="list-style-type: decimal; padding-left: 1.5rem; margin: 0.75rem 0;">${formattedItems.join('')}</ol>`);
      });
    }

    listMatch = text.match(/^(\* .*(?:\n(?!\* )[^\n]*)*\n*)+/gm);
    if (listMatch) {
      listMatch.forEach(list => {
        const items = list.split(/\n(?=\* )/);
        const formattedItems = items.map(item =>
          `<li style="margin-bottom: 0.5rem;">${item.replace(/^\* /, '').trim()}</li>`
        );
        text = text.replace(list, `<ul style="list-style-type: disc; padding-left: 1.5rem; margin: 0.75rem 0;">${formattedItems.join('')}</ul>`);
      });
    }

    const tableMatch = text.match(/\|\s*[^|]+\s*\|[\s\S]*?\n(?:\n|$)/g);
    if (tableMatch) {
      tableMatch.forEach(table => {
        const rows = table.trim().split('\n');
        if (rows.length < 2) return;

        let htmlTable = '<table style="border-collapse: collapse; width: 100%; margin: 1rem 0;">';
        const headers = rows[0].split('|').filter(cell => cell.trim());
        htmlTable += '<thead><tr>' + headers.map(h => `<th style="border: 1px solid #e5e7eb; padding: 0.5rem; background-color: #f1f5f9;">${h.trim()}</th>`).join('') + '</tr></thead>';

        htmlTable += '<tbody>';
        for (let i = 2; i < rows.length; i++) {
          if (!rows[i].trim()) continue;
          const cells = rows[i].split('|').filter(cell => cell.trim());
          htmlTable += '<tr>' + cells.map(c => `<td style="border: 1px solid #e5e7eb; padding: 0.5rem;">${c.trim()}</td>`).join('') + '</tr>';
        }
        htmlTable += '</tbody></table>';
        text = text.replace(table, htmlTable);
      });
    }

    text = text.replace(/\n\n/g, '</p><p style="margin-bottom: 1rem;">');
    text = text.replace(/\n/g, '<br />');
    if (!text.startsWith('<')) text = `<p style="margin-bottom: 1rem;">${text}</p>`;
    return text;
  };

  const processAiQuery = useCallback(async (query: string) => {
    setIsProcessing(true);
    toast("AI is finding your answer...");

    try {
      const result = await SearchAI({ query, fileId });
      const UnformattedAns = JSON.parse(result);
      let AllUnformattedAns = '';
      if (UnformattedAns) {
        UnformattedAns.forEach((item: { pageContent: string }) => {
          AllUnformattedAns += item.pageContent;
        });
      }

      const cleanQuery = query.replace(/^(explain it with example|show me an example|give me an example|provide an example)$/i, "Please provide an example of edit distance");

      const PROMPT = `For question: ${cleanQuery}

With the given context: ${AllUnformattedAns}

Please provide a clear, well-structured answer. Format your response with:
- Clear headers for different sections
- Use numbered lists where appropriate
- Include proper spacing for readability
- Always include at least one complete example to illustrate the concept
- Make sure to lay out step-by-step explanations for algorithms
- Ensure tables and structured data are clearly formatted`;

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: PROMPT }),
      });

      if (!response.ok) throw new Error((await response.json()).error || 'Failed to generate response');

      let plainTextAnswer = (await response.json()).text.trim();
      plainTextAnswer = plainTextAnswer.replace(/^(Okay, I understand\.|I will answer.*?Using plain text.*?|Including an example.*?)\s*/i, '');

      const formattedAnswer = convertTextToHTML(plainTextAnswer);
      const { from, to } = editor.state.selection;
      editor.view.dispatch(editor.state.tr.delete(from, to));

      const qaContainer = `
<div style="margin: 1.5rem 0; border-radius: 0.5rem; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); border: 1px solid #e5e7eb;">
  <div style="padding: 1rem; background-color: #f8fafc; border-bottom: 1px solid #e5e7eb;">
    <div style="display: inline-block; padding: 0.25rem 0.5rem; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; border-radius: 0.25rem; background-color: #e0e7ff; color: #4338ca;">Question</div>
    <div style="font-size: 0.95rem; line-height: 1.5;">${query}</div>
  </div>
  <div style="padding: 1rem; background-color: #ffffff;">
    <div style="display: inline-block; padding: 0.25rem 0.5rem; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; border-radius: 0.25rem; background-color: #dcfce7; color: #166534;">Answer</div>
    <div style="font-size: 0.95rem; line-height: 1.7; white-space: pre-wrap;">${formattedAnswer}</div>
  </div>
</div>`;

      editor.commands.insertContent(qaContainer);

      await saveNotes({
        notes: editor.getHTML(),
        fileId,
        createdBy: user?.primaryEmailAddress?.emailAddress || ''
      });

      toast.success("Answer generated successfully");
    } catch (error) {
      toast.error(`AI Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  }, [SearchAI, fileId, editor, saveNotes, user]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        const { from, to } = editor.state.selection;
        const lineText = editor.state.doc.textBetween(from, to);
        if (lineText.trim().startsWith('?') || lineText.trim().startsWith('!')) {
          processAiQuery(lineText.trim().substring(1));
        }
      }
    };
    editor?.view.dom.addEventListener('keydown', handleKeyDown);
    return () => editor?.view.dom.removeEventListener('keydown', handleKeyDown);
  }, [editor, processAiQuery]);

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
        {[{ icon: Bold, action: 'bold' }, { icon: Italic, action: 'italic' }, { icon: Underline, action: 'underline' }, { icon: Code, action: 'code' }, { icon: Highlighter, action: 'highlight' }].map(({ icon: Icon, action }) => (
          <button
            key={action}
            onClick={() => editor.chain().focus().toggleMark(action).run()}
            className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${editor.isActive(action) ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'}`}
            title={action.charAt(0).toUpperCase() + action.slice(1)}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}

        <div className="h-4 w-px bg-gray-200 mx-1"></div>

        <button
          onClick={onAiClick}
          disabled={isProcessing}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
            isProcessing ? 'bg-indigo-100 text-indigo-400 cursor-not-allowed' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600'
          }`}
          title="Ask AI"
        >
          {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /><span className="text-xs font-medium">Processing...</span></> : <><Sparkle className="w-4 h-4" /><span className="text-xs font-medium">Ask AI</span></>}
        </button>
      </div>
    </div>
  );
}

export default EditorExtensions;
