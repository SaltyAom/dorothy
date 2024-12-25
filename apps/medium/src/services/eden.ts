import { treaty } from '@elysiajs/eden'
import type { app } from 'resonator'

export const resonator = treaty<app>(
    process.env.NEXT_PUBLIC_RESONATOR ?? 'http://192.168.0.211:3001',
    {
        fetch: {
            credentials: 'include',
            next: { revalidate: 0 }
        }
    }
)
export type resonator = typeof resonator

resonator.character({ id: '123' }).chat.post({
	conversationId: '123',
	'content': 'awd'
})
