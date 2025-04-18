import { Suspense } from 'react'
import TestAgenda from './TestAgenda'

export default function Page() {
  return (
    <Suspense fallback={<div>Loading test agenda...</div>}>
      <TestAgenda />
    </Suspense>
  )
}
