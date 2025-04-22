import { useCallback, useState } from "react"

export default function useTestMode(initial: boolean = false) {
  const [isTesting, setIsTesting] = useState(initial)

  const enableTestMode = useCallback(() => setIsTesting(true), [])
  const disableTestMode = useCallback(() => setIsTesting(false), [])

  return { isTesting, enableTestMode, disableTestMode }
}
