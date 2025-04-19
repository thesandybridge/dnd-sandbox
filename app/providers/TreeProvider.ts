'use client'

import { createTreeContext } from './TreeContextFactory'
import type { BlockContent } from '@/app/hooks/useAgendaDetails'

export const { createTreeProvider, useTreeContext } = createTreeContext<BlockContent>()
export const TreeProvider = createTreeProvider()
