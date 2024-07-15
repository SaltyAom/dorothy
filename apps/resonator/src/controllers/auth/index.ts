import { Elysia, t } from 'elysia'

import { dream, ElyAuth } from '@resonator/libs'

export const auth = new Elysia({
    name: '@controller/auth',
    prefix: '/auth'
})
    .use(ElyAuth)
    .guard(
        {
            body: t.Object({
                username: t.String(),
                password: t.String()
            })
        },
        (app) =>
            app
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
    .guard({
        isSignIn: true
    })
    .get('/profile', ({ user }) => user.profile)
    .patch(
        '/profile',
        async ({ body, user }) => dream.user.update(await user.id, body),
        {
            body: t.Omit(t.Partial(dream.user.schema.profile), ['id', 'role'])
        }
    )
    .get('/refresh', async ({ user }) => {
        await user.refresh()

        return user.profile
    })
    .get('/sign-out', async ({ user, cookie: { session } }) => {
        try {
            await user.signOut()
        } catch {
            session.remove()
        }

        return 'Signed out'
    })
