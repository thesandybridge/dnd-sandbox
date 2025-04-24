
import Agenda from './components/Agenda';
import { BlockProvider } from './providers/BlockProvider'
import { ReactScan } from './ReactScan';

export default function AgendaPage() {
  return (
    <>
      <ReactScan enabled />
      <BlockProvider>
        <Agenda />
      </BlockProvider>
    </>
  );
}
