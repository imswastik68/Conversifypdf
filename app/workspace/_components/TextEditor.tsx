import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import EditorExtensions from './EditorExtensions'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useEffect } from 'react'

function TextEditor({fileId}: {fileId: string}) {
    const notes = useQuery(api.notes.GetNotes,{
        fileId:fileId
    })

    const editor = useEditor({
        extensions: [StarterKit,
            Placeholder.configure({
                placeholder: 'Start Taking your notes here...',
            }),
        ],
        editorProps:{
            attributes: {
                class: 'focus:outline-none min-h-full p-5 prose prose-sm max-w-none'
            }
        }
    })

    useEffect(() => {
        if (editor && notes) {
            editor.commands.setContent(notes)
        }
    },[editor, notes])

    return (
        <div className="flex flex-col h-full">
            {editor && <EditorExtensions editor={editor} />}    
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <EditorContent editor={editor} className="h-full" />
            </div>
        </div>
    )
}

export default TextEditor