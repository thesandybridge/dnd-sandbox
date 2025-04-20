
import Agenda from './components/Agenda';
import { BlockProvider } from './providers/BlockProvider'
import { Block } from './types/block';

const fetchedBlocks: Block[] = [
  { id: '1', type: 'section', parentId: null, order: 0 },
  { id: '2', type: 'topic', parentId: '1', order: 1 },
]

export default function AgendaPage() {
  return (
    <BlockProvider initialBlocks={fetchedBlocks}>
      <Agenda />
    </BlockProvider>
  );
}
