import { BlockProvider } from "../providers/BlockProvider";

export default function TestAgendaLayout({ children }: { children: React.ReactNode }) {
  return (
    <BlockProvider>
      {children}
    </BlockProvider>
  )
}
