import { Elysia, t } from 'elysia'

import { createInsertSchema } from 'drizzle-typebox'
import { Table, dream, ElyAuth } from '@resonator/libs'

const createCharacterBase = createInsertSchema(Table.character, {
    image: t.File({
        type: 'image',
        maxSize: '2m'
    })
})

const createCharacter = t.Omit(createCharacterBase, ['id', 'creatorId'])

export const characterEditor = new Elysia({
    name: '@controller/editor/character',
    prefix: '/editor/character'
})
    .use(ElyAuth)
    .guard(
        {
            isSignIn: true
        },
        (app) =>
            app
                .get('', async ({ user }) =>
                    dream.editor.character.list(await user.id)
                )
                .get('/:id', async ({ user, params: { id } }) =>
                    dream.character.byId(id, {
                        instruction: true,
                        creatorId: await user.id
                    })
                )
                .put(
                    '',
                    async ({ body, user }) =>
                        dream.editor.character.create(await user.id, body),
                    {
                        body: createCharacter
                    }
                )
                .patch(
                    '/:id',
                    async ({ body, params: { id: characterId }, user }) =>
                        dream.editor.character.update(
                            characterId,
                            await user.id,
                            body
                        ),
                    {
                        body: t.Partial(createCharacter)
                    }
                )
    )
