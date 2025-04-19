
import Agenda from './components/Agenda';
import { Block, BlockProvider } from './providers/BlockProvider'

const fetchedBlocks: Block[] = [
  { id: '1', type: 'section', parentId: null },
  { id: '2', type: 'topic', parentId: '1' },
]

export default function AgendaPage() {
  return (
    <BlockProvider initialBlocks={fetchedBlocks}>
      <Agenda />
    </BlockProvider>
  );
}
