
import Agenda from './components/Agenda';
import { AgendaProvider } from './providers/AgendaProvider'

export interface Agenda {
  id: string,
  type: string,
  parentId: string | null
}

export default function AgendaPage() {
  return (
    <AgendaProvider>
      <Agenda />
    </AgendaProvider>
  );
}
