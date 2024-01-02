import { t, error } from 'elysia'

import { DreamRepository } from './base'
import { DreamEditor } from './editor'

import { and, desc, eq, or } from 'drizzle-orm/sql'
import type { InferInsertModel } from 'drizzle-orm/table'
import { createInsertSchema } from 'drizzle-typebox'

import { AI, Storage, instruct } from '@resonator/libs'
import { Table, conversation } from '../table'

class User extends DreamRepository {
    schema = {
        profile: createInsertSchema(Table.user, {
            profile: t.File({
                type: 'image'
            })
        })
    } as const

    by(id: string) {
        return this.db.query.user
            .findFirst({
                where: eq(Table.user.id, id)
            })
            .execute()
    }

    async update(
        id: string,
        { profile, ...data }: Partial<typeof this.schema.profile>
    ) {
        const user = await this.db.query.user
            .findFirst({
                columns: {
                    username: true
                },
                where: eq(Table.user.id, id)
            })
            .execute()

        if (!user) throw new Error('User not found')

        return this.db
            .update(Table.user)
            .set({
                profile: await Storage.upload(profile, {
                    name: user.username,
                    prefix: 'profile/'
                }),
                ...data
            })
            .where(eq(Table.user.id, id))
            .returning()
            .execute()
            .then(this.toOne)
    }
}

class Character extends DreamRepository {
    list<T extends boolean = false>(
        page: number,
        {
            instruction = false as T
        }: {
            instruction?: T
        } = {}
    ) {
        return this.db.query.character
            .findMany({
                offset: this.batch(page),
                limit: this.config.batchSize,
                columns: {
                    id: true,
                    name: true,
                    image: true,
                    instruction,
                    greeting: true
                }
            })
            .execute()
    }

    byId<T extends boolean = false>(
        id: string,
        {
            instruction = false as T,
            creatorId
        }: {
            instruction?: T
            creatorId?: string
        } = {}
    ) {
        return this.db.query.character
            .findFirst({
                where: creatorId
                    ? and(
                          eq(Table.character.id, id),
                          eq(Table.character.creatorId, creatorId)
                      )
                    : eq(Table.character.id, id),
                columns: {
                    id: true,
                    name: true,
                    image: true,
                    greeting: true,
                    introduction: true,
                    instruction
                }
            })
            .execute()
            .then((character) => {
                if (!character)
                    throw error('Bad Request', 'Character not found')

                return character
            })
    }

    async getRooms(userId: string, page = 1) {
        return this.db.query.room
            .findMany({
                offset: this.batch(page),
                limit: this.config.batchSize,
                where: eq(Table.room.userId, userId),
                orderBy: desc(Table.room.updatedAt),
                columns: {},
                with: {
                    character: {
                        columns: {
                            id: true,
                            name: true,
                            image: true,
                            greeting: true
                        }
                    }
                }
            })
            .execute()
    }

    exists(id: string) {
        return this.db.query.character
            .findFirst({
                columns: {
                    id: true
                },
                where: eq(Table.character.id, id)
            })
            .execute()
    }

    byName(name: string) {
        return this.db.query.character
            .findFirst({
                where: eq(Table.character.name, name)
            })
            .execute()
    }
}

class Conversation extends DreamRepository {
    getRoom(userId: string, characterId: string) {
        return this.db.query.room
            .findFirst({
                where: and(
                    eq(Table.room.userId, userId),
                    eq(Table.room.characterId, characterId)
                ),
                orderBy: desc(Table.room.updatedAt),
                with: {
                    conversations: {
                        orderBy: desc(Table.conversation.updatedAt),
                        limit: 2
                    }
                }
            })
            .execute()
    }

    getRooms(userId: string, characterId: string) {
        return this.db.query.room
            .findMany({
                where: eq(Table.room.userId, userId),
                orderBy: desc(Table.room.updatedAt),
                with: {
                    conversations: {
                        orderBy: desc(Table.conversation.updatedAt),
                        limit: 2
                    }
                }
            })
            .execute()
    }

    async getConversations(userId: string, characterId: string) {
        return this.db.query.room.findFirst({
            where: and(
                eq(Table.room.userId, userId),
                eq(Table.room.characterId, characterId)
            ),
            orderBy: desc(Table.room.updatedAt),
            columns: {
                active: true,
                updatedAt: true
            },
            with: {
                conversations: {
                    orderBy: desc(Table.conversation.updatedAt),
                    with: {
                        chats: {
                            orderBy: desc(Table.chat.createdAt),
                            limit: 1
                        }
                    }
                }
            }
        })
    }

    async createNewConversation(userId: string, characterId: string) {
        const { id: roomId } = await this.createRoom(userId, characterId)
        const { id: activeId } = await this.createConversation(roomId)

        await this.setActiveConversation(userId, characterId, activeId)

        return activeId
    }

    async getActiveConversation(userId: string, characterId: string) {
        return this.db.transaction(async (db) => {
            let active = await this.db.query.room
                .findFirst({
                    columns: {
                        active: true
                    },
                    where: and(
                        eq(Table.room.userId, userId),
                        eq(Table.room.characterId, characterId)
                    )
                })
                .execute()
                .then((room) => room?.active)

            if (!active)
                active = await this.createNewConversation(userId, characterId)

            return active
        })
    }

    async getMessages(conversationId: string) {
        return this.db.query.chat
            .findMany({
                where: eq(Table.chat.conversationId, conversationId),
                orderBy: desc(Table.chat.createdAt)
            })
            .execute()
    }

    async setActiveConversation(
        userId: string,
        characterId: string,
        conversationId: string,
        {
            validate = false
        }: {
            validate?: boolean
        } = {}
    ) {
        if (validate) {
            const data = await this.db.query.conversation
                .findFirst({
                    where: eq(Table.conversation.id, conversationId),
                    columns: {},
                    with: {
                        room: {
                            columns: {
                                characterId: true,
                                active: true
                            }
                        }
                    }
                })
                .execute()

            if (
                !data ||
                data.room.characterId !== characterId ||
                data.room.active === conversationId
            )
                return
        }

        return this.db
            .update(Table.room)
            .set({
                active: conversationId
            })
            .where(
                and(
                    eq(Table.room.userId, userId),
                    eq(Table.room.characterId, characterId)
                )
            )
            .execute()
    }

    async createRoom(userId: string, characterId: string) {
        const room = await this.db.query.room
            .findFirst({
                columns: {
                    id: true
                },
                where: and(
                    eq(Table.room.userId, userId),
                    eq(Table.room.characterId, characterId)
                )
            })
            .execute()

        if (room) return room

        return this.db
            .insert(Table.room)
            .values({
                userId,
                characterId
            })
            .onConflictDoNothing()
            .returning({
                id: Table.room.id
            })
            .execute()
            .then(this.toOne)
    }

    createConversation(roomId: string) {
        return this.db
            .insert(Table.conversation)
            .values({
                roomId
            })
            .returning({
                id: Table.room.id
            })
            .execute()
            .then(this.toOne)
    }

    async getChats(userId: string, characterId: string) {
        const conversationId = await this.getActiveConversation(
            userId,
            characterId
        )

        return this.getChatsById(userId, characterId, conversationId)
    }

    async getChatsById(
        userId: string,
        characterId: string,
        conversationId: string
    ) {
        const data = await this.db.query.conversation.findFirst({
            columns: {},
            with: {
                room: {
                    columns: {
                        id: true
                    }
                },
                chats: {
                    columns: {
                        id: true,
                        createdAt: true,
                        content: true,
                        role: true,
                        images: true
                    }
                }
            },
            where: eq(Table.conversation.id, conversationId)
        })

        if (!data) return []

        const {
            room: { id },
            chats
        } = data

        // if (id !== conversationId) return []

        return chats.map(({ images, ...chat }) => ({
            ...chat,
            images: images?.split(',')
        }))
    }

    async chat({
        userId,
        characterId,
        repository,
        body: { content, time, conversationId: userConversationId, images }
    }: {
        userId: string
        characterId: string
        repository: typeof dream
        body: {
            content: string
            time?: string
            conversationId?: string
            images?: File[]
        }
    }) {
        const now = new Date().getTime()

        const character = await repository.character.byId(characterId, {
            instruction: true
        })

        if (!character) throw error('Bad Request', 'Character not found')

        const { instruction, greeting } = character

        const conversationId =
            userConversationId ||
            (await this.getActiveConversation(userId, characterId))

        if (userConversationId)
            this.setActiveConversation(userId, characterId, conversationId, {
                validate: true
            })

        const previousChats = await this.getChatsById(
            userId,
            characterId,
            conversationId
        )

        if (!Array.isArray(previousChats))
            throw error('Unauthorized', 'You do not own this conversation')

        const [sentence, imagesLink] = await Promise.all([
            AI.gemini.chat({
                name: character.name,
                character: character.instruction,
                greeting: character.greeting,
                time,
                chats: previousChats,
                content,
                images
            }),
            await Storage.uploadMultiple(images, {
                prefix: `uploads/${characterId}`
            })
        ])

        const saveChat = (id = conversationId) => {
            this.db
                .update(Table.conversation)
                .set({
                    updatedAt: now
                })
                .where(eq(Table.conversation.id, id))
                .returning({
                    roomId: Table.conversation.roomId
                })
                .execute()
                .then((conversations) =>
                    conversations.forEach((conversation) => {
                        if (!conversation) return

                        this.db
                            .update(Table.room)
                            .set({
                                updatedAt: now
                            })
                            .where(
                                eq(
                                    Table.conversation.roomId,
                                    conversation.roomId
                                )
                            )
                            .execute()
                    })
                )

            return this.db
                .insert(Table.chat)
                .values([
                    {
                        conversationId: id,
                        role: 'user',
                        content,
                        createdAt: now,
                        images: imagesLink?.join(',')
                    },
                    {
                        conversationId: id,
                        role: 'assistant',
                        content: sentence
                    }
                ])
                .execute()
        }

        try {
            await saveChat()
        } catch {
            await saveChat(
                await this.getActiveConversation(userId, characterId)
            )
        }

        return {
            content: sentence
        }
    }
}

export class Dream extends DreamRepository {
    user = new User(this.db, this.config)
    character = new Character(this.db, this.config)
    conversation = new Conversation(this.db, this.config)

    editor = new DreamEditor(this.db, this.config)
}

export const dream = new Dream()
