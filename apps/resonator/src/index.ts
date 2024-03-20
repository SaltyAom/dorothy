import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'

import { auth, admin, character } from './controllers'

const app = new Elysia()
    .use(
        cors({
            credentials: true,
            allowedHeaders: ['Content-Type', 'Set-Cookie'],
            origin: true
        })
    )
    .use(admin)
    .use(auth)
    .use(character)

if (process.env.NODE_ENV !== 'production') app.use(swagger())

app.listen({
    port: process.env.PORT ?? 3001,
    hostname: '0.0.0.0'
})

export type app = typeof app

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
