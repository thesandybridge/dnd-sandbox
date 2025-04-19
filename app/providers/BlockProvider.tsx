'use client'

import { createBlockContext } from '@/app/providers/BlockContextFactory'
import { Block } from '../types/block'

export const { BlockProvider, useBlocks } = createBlockContext<Block>()
