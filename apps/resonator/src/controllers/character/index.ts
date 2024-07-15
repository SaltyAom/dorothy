import { Elysia, t } from 'elysia'
import { rateLimit } from 'elysia-rate-limit'

import { ElyAuth, dream } from '@resonator/libs'

export const character = new Elysia({
    name: '@controller/character',
    prefix: '/character'
})
    .use(ElyAuth)
    .get('/list/:page', ({ params: { page } }) => dream.character.list(page), {
        params: t.Object({
            page: t.Numeric({
                minimum: 1
            })
        })
    })
    .get(
        '/room/:page',
        async ({ user, params: { page } }) =>
            dream.character.getRooms(await user.id, page),
        {
            isSignIn: true,
            params: t.Object({
                page: t.Numeric({
                    minimum: 1
                })
            })
        }
    )
    .group(
        '/:id',
        {
            isSignIn: true,
            beforeHandle: async function checkCharacterExistence({ params: { id }, set, error }) {
                const character = await dream.character.exists(id)

                if (!character)
                	return error('Bad Request', 'Character not found')
            }
        },
        (app) =>
            app
                .get('', ({ params: { id } }) => dream.character.byId(id))
                // .use(
                //     rateLimit({
                //         max: 10,
                //         duration: 1500
                //     })
                // )
                .get(
                    '/chat',
                    async ({
                        user,
                        params: { id: characterId },
                        query: { conversation: conversationId }
                    }) => {
                        const userId = await user.id

                        if (conversationId) {
                            setImmediate(() => {
                                dream.conversation.setActiveConversation(
                                    userId,
                                    characterId,
                                    conversationId
                                )
                            })
                            return dream.conversation.getChatsById(
                                userId,
                                characterId,
                                conversationId
                            )
                        }

                        return dream.conversation.getChats(userId, characterId)
                    },
                    {
                        query: t.Object({
                            conversation: t.Optional(t.String())
                        })
                    }
                )
                .post(
                    '/chat',
                    async ({ user, body, params: { id: characterId }, trace }) =>
                        dream.conversation.chat({
                            userId: await user.id,
                            characterId,
                            repository: dream,
                            body
                        }),
                    {
                        body: t.Object({
                            conversationId: t.Optional(t.String()),
                            content: t.String(),
                            time: t.Optional(t.String()),
                            images: t.Optional(
                                t.Files({
                                    maxSize: '4m',
                                    type: [
                                        'image/png',
                                        'image/jpeg',
                                        'image/webp',
                                        'image/heic'
                                    ]
                                })
                            )
                        })
                    }
                )
                .get(
                    '/chat/list',
                    async ({ user, params: { id: characterId } }) =>
                        dream.conversation.getConversations(
                            await user.id,
                            characterId
                        )
                )
                .put(
                    '/chat/list',
                    async ({ user, params: { id: characterId }, body }) =>
                        dream.conversation.createNewConversation(
                            await user.id,
                            characterId
                        )
                )
    )
