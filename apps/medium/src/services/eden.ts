import { edenTreaty } from '@elysiajs/eden'
import type { app } from 'resonator'

export const resonator = edenTreaty<app>(
    process.env.NEXT_PUBLIC_RESONATOR ?? 'http://192.168.0.181:3001',
    {
        $fetch: {
            credentials: 'include'
        }
    }
)
export type resonator = typeof resonator
