import { useEffect, useRef, useState } from 'react'

const ALL_MODIFIERS = ['Shift', 'Meta', 'Control', 'Alt'] as const
type ModifierKey = typeof ALL_MODIFIERS[number]

export function useDraggingModifierKey(modifierKey: ModifierKey, isDragging: boolean) {
  const [pressed, setPressed] = useState(false)
  const pressedRef = useRef(false)

  const otherModifiers = ALL_MODIFIERS.filter(k => k !== modifierKey)

  useEffect(() => {
    if (!isDragging) {
      setPressed(false)
      pressedRef.current = false
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
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
      pressedRef.current = false
      setPressed(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [modifierKey, otherModifiers, isDragging])

  const DisplayKey = () => (
    <kbd className="px-1.5 py-0.5 border rounded text-sm bg-gray-100 text-gray-800 border-gray-300 shadow-inner">
      {modifierKey === 'Meta' ? '⌘' : modifierKey}
    </kbd>
  )

  return { pressed, pressedRef, DisplayKey }
}
