
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { ChatSession } from '@google/generative-ai';
import { Editor } from '@tiptap/react';
import { useAction, useMutation } from 'convex/react';
import { Bold, Code, Highlighter, Italic, Sparkle, Underline } from 'lucide-react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

function EditorExtensions({ editor }: { editor: Editor }) {

        const { fileId } = useParams();
        if (typeof fileId !== 'string') {
            throw new Error('fileId must be a string');
        }
        const SearchAI = useAction(api.myActions.search);
        const saveNotes = useMutation(api.notes.AddNotes);
        const {user} = useUser();

        const onAiClick = async() => {
            toast("AI is getting your answer...");
            const selectedText = editor.state.doc.textBetween(
                editor.state.selection.from,
                editor.state.selection.from,
                " "
            )

            const result = await SearchAI({
                query: selectedText,
                fileId: fileId
            })

            const UnformattedAns = JSON.parse(result);
            let AllUnformattedAns = '';
            if (UnformattedAns) {
                UnformattedAns.forEach((item: { pageContent: string }) => {
                    AllUnformattedAns += item.pageContent;
                });
            }

            const PROMPT = "For question :"+selectedText+" and with the given content as answer,"+ 
            "please give appropriate answer in HTML format. The answer content is"+ AllUnformattedAns;

            const AiModelResult = await ChatSession.sendMessage(PROMPT);
            const FinalAns = AiModelResult.response.text()().replace('```','').replace('html','');

            const AllText = editor.getHTML();
            editor.commands.setContent(AllText + "<p> <strong> Answer: </strong>"+FinalAns+ "</p>");

            saveNotes({
                notes: editor.getHTML(),
                fileId: fileId,
                createdBy: user?.primaryEmailAddress?.emailAddress || ''
            })
        }

        

  return (
    <div className='p-5' >
        <div className="control-group">
            <div className="button-group flex gap-3">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive('bold') ? 'text-blue-500' : ''}
                >
                    <Bold />
                </button>

                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive('italic') ? 'text-blue-500' : ''}
                >
                    <Italic />
                </button>

                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={editor.isActive('underline') ? 'text-blue-500' : ''}
                >
                    <Underline />
                </button>

                <button
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={editor.isActive('code') ? 'text-blue-500' : ''}
                >
                    <Code />
                </button>

                <button
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    className={editor.isActive('highlight') ? 'text-blue-500' : ''}
                >
                    <Highlighter />
                </button>

                <button
                    onClick={() => onAiClick()}
                    className='hover:text-blue-500'
                >
                    <Sparkle />
                </button>
            </div>
        </div>
    </div>
  )
}

export default EditorExtensions