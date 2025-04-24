'use client'

import { createTreeContext } from './TreeContextFactory'
import type { BlockContent } from '@/app/types/agenda'

export const { createTreeProvider, useTreeContext } = createTreeContext<BlockContent>()
export const TreeProvider = createTreeProvider()
