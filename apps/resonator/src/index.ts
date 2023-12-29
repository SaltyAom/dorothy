import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'

import { auth, admin, character } from './controllers'

const app = new Elysia()
    .use(
        cors({
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'],
            allowedHeaders: ['Content-Type']
        })
    )
    .use(admin)
    .use(auth)
    .use(character)
    .listen({
        port: process.env.PORT ?? 3001,
        hostname: '0.0.0.0'
    })

if (process.env.NODE_ENV !== 'production') app.use(swagger())

export type app = typeof app

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
