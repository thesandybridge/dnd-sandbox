
import Agenda from './components/Agenda';
import { AgendaProvider } from './providers/AgendaProvider'

export default function AgendaPage() {
  return (
    <AgendaProvider>
      <Agenda />
    </AgendaProvider>
  );
}
