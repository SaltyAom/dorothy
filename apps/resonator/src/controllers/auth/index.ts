import { Elysia, t } from 'elysia'
import { rateLimit } from 'elysia-rate-limit'
import { createInsertSchema } from 'drizzle-typebox'

import { bearer } from '@elysiajs/bearer'

import { Auth, dream } from '@resonator/libs'

export const auth = new Elysia({
    name: '@controller/auth',
    prefix: '/auth'
})
    .use(bearer())
    .use(Auth.elysia)
    .guard(
        {
            body: t.Object({
                username: t.String(),
                password: t.String()
            })
        },
        (app) =>
            app
                // .use(
                //     rateLimit({
                //         max: 8,
                //         duration: 1500
                //     })
                // )
                .put('/sign-up', async ({ body, user }) =>
                    user.signUp({
                        ...body,
                        role: 'user'
                    })
                )
                .post('/sign-in', async ({ user, body, cookie, set }) => {
                    try {
                        await user.signIn(body)

                        return true
                    } catch {
                        return 'Invalid username or password'
                    }
                })
    )
    .guard(
        {
            isSignIn: true
        },
        (app) =>
            app
                .get('/profile', ({ user }) => user.profile)
                .patch(
                    '/profile',
                    async ({ body, user }) =>
                        dream.user.update(await user.id, body),
                    {
                        body: t.Omit(t.Partial(dream.user.schema.profile), [
                            'id',
                            'role'
                        ])
                    }
                )
                .get('/refresh', async ({ user }) => {
                    await user.refresh()

                    return user.profile
                })
                .get('/sign-out', async ({ user }) => {
                    await user.signOut()

                    return 'Signed out'
                })
    )
