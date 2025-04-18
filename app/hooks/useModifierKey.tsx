import { useEffect, useRef, useState } from 'react'

const ALL_MODIFIERS = ['Shift', 'Meta', 'Control', 'Alt'] as const
type ModifierKey = typeof ALL_MODIFIERS[number]

/**
 * Returns true if the current focus is on a content-editable element (Tiptap, inputs, etc).
 */
function isInEditableContext(): boolean {
  const el = document.activeElement
  return !!(
    el &&
    (el instanceof HTMLInputElement ||
      el instanceof HTMLTextAreaElement ||
      (el instanceof HTMLElement && el.isContentEditable))
  )
}

/**
 * Tracks exclusive modifier key press (e.g. Shift but not Shift+Ctrl),
 * ignoring presses when focused in content-editable elements like Tiptap.
 */
export function useModifierKey(modifierKey: ModifierKey) {
  const [pressed, setPressed] = useState(false)
  const pressedRef = useRef(false)

  const otherModifiers = ALL_MODIFIERS.filter(k => k !== modifierKey)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInEditableContext()) return

      const isOnlyPressed =
        e.getModifierState(modifierKey) &&
        otherModifiers.every(mod => !e.getModifierState(mod))

      if (isOnlyPressed) {
        pressedRef.current = true
        setPressed(true)
      } else {
        pressedRef.current = false
        setPressed(false)
      }
    }

    const handleKeyUp = () => {
      if (isInEditableContext()) return
      pressedRef.current = false
      setPressed(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [modifierKey, otherModifiers])

  const DisplayKey = () => (
    <kbd className="px-1.5 py-0.5 border rounded text-sm bg-gray-100 text-gray-800 border-gray-300 shadow-inner">
      {modifierKey === 'Meta' ? '⌘' : modifierKey}
    </kbd>
  )

  return { pressed, pressedRef, DisplayKey }
}
