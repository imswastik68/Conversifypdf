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
                class: 'focus: outline-none h-screen p-5'
            }
        }
    })

    useEffect(() => {
        if (editor && notes) {
            editor.commands.setContent(notes)
        }
    },[editor, notes])

    

    return (
        <div>
            {editor && <EditorExtensions editor={editor} />}    
            <div className='h-[88vh] overflow-scroll'>
              <EditorContent editor={editor} />
            </div>
        </div>
    )
}

export default TextEditor