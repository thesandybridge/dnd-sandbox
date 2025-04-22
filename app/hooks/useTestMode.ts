'use client'
import { usePathname } from 'next/navigation'

export default function useTestMode() {
  const pathname = usePathname()

  const isTesting = pathname.startsWith('/test') || pathname.includes('preview') // or whatever your route is

  return { isTesting }
}
