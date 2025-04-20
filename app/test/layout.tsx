import { Suspense } from "react";
import TestAgendaLayout from "./TestAgenda";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading test agenda...</div>}>
      <TestAgendaLayout>
        {children}
      </TestAgendaLayout>
    </Suspense>
  )
}
