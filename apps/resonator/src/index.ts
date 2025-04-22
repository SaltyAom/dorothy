const t1 = performance.now()

import { Elysia, t } from 'elysia'

import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'

import { auth, admin, character } from './controllers'
// import { tracing } from './libs'

const app = new Elysia()
    // .use(tracing)
    .use(cors())
    .use(admin)
    .use(auth)
    .use(character)
    .use((app) => {
        if (process.env.NODE_ENV !== 'production') return app.use(swagger())

        return app
    })

console.log('Resonator took', performance.now() - t1, 'ms')

app.listen({
    port: process.env.PORT ?? 3001,
    hostname: '0.0.0.0'
})

export type app = typeof app

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
