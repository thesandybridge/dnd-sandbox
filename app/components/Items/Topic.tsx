'use client'

import { memo, useCallback, useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useQueryClient } from '@tanstack/react-query'

import { useDraggable } from '@dnd-kit/core'
import { Block } from '@/app/types/block'
import { BlockContent, TopicContent } from '@/app/hooks/useAgendaDetails'
import { useBlocks } from '@/app/providers/BlockProvider'
import DragHandle from '../BlockTree/DragHandle'
import Comments from './Comments'

interface Props {
  block: Block
  content?: TopicContent
}

const Topic = ({ block, content }: Props) => {
  const [showComments, setShowComments] = useState(false)
  const queryClient = useQueryClient()
  const { deleteItem } = useBlocks()

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: block.id
  });

  const style = {
    transform: `translate(${transform?.x ?? 0}px, ${transform?.y ?? 0}px)`,
  };

  const handleToggleComments = useCallback(() => setShowComments(!showComments), [showComments])

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
      className={`transition-opacity ${isDragging ? 'opacity-0' : 'opacity-100'} flex flex-col gap-2 items-center rounded-lg p-4 border border-gray-300`}
    >
      <div className='flex gap-2 items-center space-between w-full'>
        <DragHandle
          listeners={listeners}
          attributes={attributes}
          testId={block.testId}
          blockId={block.id}
        />
        <div className='grow'>
          <EditorContent editor={editor} />
        </div>
        <button
          onClick={handleDelete}
        >
          ×
        </button>
      </div>

      <div className='flex flex-col w-full justify-center items-center'>
        <button
          onClick={handleToggleComments}
        >
          {showComments ? 'Hide Comments' : 'Show Comments'}
        </button>
        {showComments && (
          <div className='w-full flex flex-col gap-2'>
            {Array.from({ length: 10 }, (_, index) => (
              <Comments key={index} id={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(Topic)
