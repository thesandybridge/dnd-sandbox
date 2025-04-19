
import Agenda from './components/Agenda';
import { BlockProvider } from './providers/BlockProvider'

export default function AgendaPage() {
  return (
    <BlockProvider>
      <Agenda />
    </BlockProvider>
  );
}
