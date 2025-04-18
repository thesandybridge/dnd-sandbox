import { useEffect, useRef, useState, JSX } from 'react'

export function useModifierKey(
  modifierKey: 'Shift' | 'Meta' | 'Control' | 'Alt' = 'Shift'
): {
  pressed: boolean
  pressedRef: React.MutableRefObject<boolean>
  DisplayKey: () => JSX.Element
} {
  const [pressed, setPressed] = useState(false)
  const pressedRef = useRef(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.getModifierState(modifierKey)) {
        pressedRef.current = true
        setPressed(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.getModifierState(modifierKey)) {
        pressedRef.current = false
        setPressed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [modifierKey])

  const DisplayKey = () => (
    <kbd className="p-1 border rounded text-sm bg-gray-100 text-gray-800 border-gray-300 shadow-inner">
      {modifierKey === 'Meta' ? '⌘' : modifierKey}
    </kbd>
  )

  return { pressed, pressedRef, DisplayKey }
}
