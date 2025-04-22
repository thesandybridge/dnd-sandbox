import { useEffect, useState, RefObject } from 'react'

export function useLocalModifierKey(ref: RefObject<HTMLElement>, key = 'Shift') {
  const [pressed, setPressed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement !== el) return
      if (e.key === key) setPressed(true)
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === key) setPressed(false)
    }

    el.addEventListener('keydown', onKeyDown)
    el.addEventListener('keyup', onKeyUp)

    return () => {
      el.removeEventListener('keydown', onKeyDown)
      el.removeEventListener('keyup', onKeyUp)
    }
  }, [ref, key])

  return pressed
}
