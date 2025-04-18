import { AgendaProvider } from '@/app/providers/AgendaProvider'

export default function TestAgendaLayout({ children }: { children: React.ReactNode }) {
  return (
    <AgendaProvider>
      {children}
    </AgendaProvider>
  )
}
