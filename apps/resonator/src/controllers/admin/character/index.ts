import { Elysia, t } from 'elysia'
import { rateLimit } from 'elysia-rate-limit'

import { createInsertSchema } from 'drizzle-typebox'
import { Table, dream, ElyAuth } from '@resonator/libs'

const createCharacterBase = createInsertSchema(Table.character, {
    image: t.File({
        type: 'image',
        maxSize: '2m'
    })
})

const createCharacter = t.Omit(createCharacterBase, ['id'])

export const characterAdmin = new Elysia({
    name: '@controller/admin/character',
    prefix: '/admin/character'
})
    .use(ElyAuth)
    .guard(
        {
            role: 'admin'
        },
        (app) =>
            app
                .put('', ({ body }) => dream.admin.character.create(body), {
                    body: createCharacter
                })
                .patch(
                    '/:id',
                    ({ body, params: { id } }) =>
                        dream.admin.character.update(id, body),
                    {
                        body: t.Partial(createCharacter)
                    }
                )
    )
