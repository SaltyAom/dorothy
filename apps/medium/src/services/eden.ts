import { edenTreaty } from '@elysiajs/eden'
import type { app } from 'resonator'

export const resonator = edenTreaty<app>(
    process.env.NEXT_PUBLIC_RESONATOR ?? 'http://127.0.0.1:3001',
    {
        $fetch: {
            credentials: 'include'
        }
    }
)
export type resonator = typeof resonator
