'use client'

import { memo, useCallback, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useQueryClient } from '@tanstack/react-query'

import { Agenda } from '../page'
import { BlockContent, TopicContent } from '../hooks/useAgendaDetails'
import { useDraggable } from '@dnd-kit/core'
import { useAgenda } from '../providers/AgendaProvider'

interface Props {
  block: Agenda
  content?: TopicContent
}

const Topic = ({ block, content }: Props) => {
  const queryClient = useQueryClient()
  const { deleteItem } = useAgenda()
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: block.id
  });
  const style = {
    transform: `translate(${transform?.x ?? 0}px, ${transform?.y ?? 0}px)`,
  };

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    deleteItem(block.id);
  }, [block.id, deleteItem]);

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
        class: 'focus:outline-none'
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
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-2 p-2 items-center space-between rounded-lg p-4 border border-gray-300"
    >
      <div {...listeners} {...attributes} className="cursor-move px-1">
        ☰ {/* drag handle icon */}
      </div>
      <div className='grow'>
        <EditorContent editor={editor} />
      </div>
      <button
        onClick={handleDelete}
      >
        ×
      </button>
    </div>
  )
}

export default memo(Topic)
