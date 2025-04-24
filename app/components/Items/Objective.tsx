'use client'

import { memo, useCallback, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useQueryClient } from '@tanstack/react-query'

import { useDraggable } from '@dnd-kit/core'
import { Block } from '@/app/types/block'
import { BlockContent, ObjectiveContent } from '@/app/types/agenda'
import { useBlocks } from '@/app/providers/BlockProvider'
import DragHandle from '../BlockTree/DragHandle'
import { useAgenda } from '@/app/hooks/useAgenda'

interface Props {
  blockId: Block['id']
  content?: ObjectiveContent
}

const Objective = ({ blockId, content }: Props) => {
  const queryClient = useQueryClient()
  const { deleteItem } = useBlocks()
  const { remove } = useAgenda()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: blockId
  });
  const style = {
    transform: `translate(${transform?.x ?? 0}px, ${transform?.y ?? 0}px)`,
  };

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    deleteItem(blockId);
    remove(blockId)
  }, [blockId, deleteItem, remove]);

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
        const current = map.get(blockId)
        if (!current) return map

        map.set(blockId, {
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
      className={`transition-opacity ${isDragging ? 'opacity-0' : 'opacity-100'} flex gap-2 p-2 items-center space-between rounded-lg p-4 border border-gray-300`}
    >
      <DragHandle
        listeners={listeners}
        attributes={attributes}
        blockId={blockId}
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
  )
}

export default memo(Objective)
