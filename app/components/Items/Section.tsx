'use client'

import { memo, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useQueryClient } from '@tanstack/react-query'

import { Block } from '@/app/types/block'
import { BlockContent, SectionContent } from '@/app/hooks/useAgendaDetails'

interface Props {
  block: Block
  content?: SectionContent
}

const Section = ({ block, content }: Props) => {
  const queryClient = useQueryClient()

  const editor = useEditor({
    content: content?.title,
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false
      })
    ],
    editorProps: {
      attributes: {
        class: 'focus:outline-none px-2 py-1 border border-transparent rounded hover:border-gray-300 focus:border-blue-400 transition w-full text-lg font-semibold'
      }
    },
    immediatelyRender: false,
    onUpdate({ editor }) {
      queryClient.setQueryData<Map<string, BlockContent>>(['agenda-details'], (old) => {
        const map = new Map(old ?? [])
        const current = map.get(block.id)
        if (!current) return map

        map.set(block.id, {
          ...current,
          title: editor.getText().trim()
        })

        return map
      })
    }
  })

  useEffect(() => {
    if (!editor) return

    const newTitle = content?.title ?? ''
    if (editor.getText().trim() !== newTitle.trim()) {
      editor.commands.setContent(newTitle)
    }
  }, [content?.title, editor])

  if (!editor) return null

  return (
    <div className="grow flex items-center">
      <EditorContent editor={editor} />
    </div>
  )
}

export default memo(Section)
