import { Elysia, error } from 'elysia'

import { Lucia } from '@elysiajs/lucia-auth'
import { libsql } from '@lucia-auth/adapter-sqlite'

import { tracing } from '../tracing'
import { client, type Table } from '../database'
import type { InferSelectModel } from 'drizzle-orm'

type Attributes = InferSelectModel<Table['user']>

export const Auth = Lucia<Attributes, 'user', 'session'>({
    name: 'user',
    session: 'session',
    adapter: libsql(client, {
        user: 'user',
        session: 'user_session',
        key: 'user_key'
    }),
    getUserAttributes({ id, username, profile }) {
        return {
            id,
            username,
            profile
        }
    },
    cookie: {
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        secure: process.env.NODE_ENV === 'production'
    }
})

export const ElyAuth = new Elysia({ name: '@services/auth' })
    .use(Auth.elysia)
    .use(tracing)
    .macro({
        role: (role: InferSelectModel<Table['user']>['role']) => ({
            async beforeHandle({ user }) {
                await user.validate()
                const { role: userRole } = await user.profile

                if (role !== userRole) return error('Unauthorized', 'Unauthorized')
            }
        })
    })
