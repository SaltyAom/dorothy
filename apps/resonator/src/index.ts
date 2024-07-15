const t1 = performance.now()

import { Elysia, t } from 'elysia'

import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'

import { auth, admin, character } from './controllers'
import { tracing } from './libs'

const app = new Elysia()
    .use(tracing)
    .use(cors())
    .use(admin)
    .use(auth)
    .use(character)

// console.log(app.routes.find(x => x.path === '/auth/profile')?.composed?.toString())

if (process.env.NODE_ENV !== 'production') app.use(swagger())

console.log('took', performance.now() - t1)

app.listen({
    port: process.env.PORT ?? 3001,
    hostname: '0.0.0.0'
})

export type app = typeof app

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
