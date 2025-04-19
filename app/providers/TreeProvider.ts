import { createTreeContext } from './TreeContextFactory'
import type { BlockContent } from '@/app/hooks/useAgendaDetails'

export const { TreeProvider, useTreeContext } = createTreeContext<BlockContent>()
