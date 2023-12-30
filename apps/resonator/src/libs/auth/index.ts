import { Elysia, error } from 'elysia'

import { Lucia } from '@elysiajs/lucia-auth'
import { libsql } from '@lucia-auth/adapter-sqlite'

import { type Table, client } from '../database'
import type { InferSelectModel } from 'drizzle-orm'

export const Auth = Lucia<InferSelectModel<Table['user']>>({
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
        // secure: process.env.NODE_ENV === 'production'
    }
})

export const ElyAuth = new Elysia({ name: '@services/auth' })
    .use(Auth.elysia)
    .macro(({ onBeforeHandle }) => {
        return {
            role(role: InferSelectModel<Table['user']>['role']) {
                onBeforeHandle(async ({ user }) => {
                    await user.validate()
                    const { role } = await user.profile

                    if (role !== role)
                        return error('Unauthorized', 'Unauthorized')
                })
            }
        }
    })
