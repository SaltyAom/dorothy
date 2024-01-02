import { relations, sql } from 'drizzle-orm'
import {
    sqliteTable,
    text,
    blob,
    integer,
    index
} from 'drizzle-orm/sqlite-core'

import { createId } from '@paralleldrive/cuid2'

export const user = sqliteTable('user', {
    id: text('id').primaryKey(),
    username: text('username').notNull(),
    profile: text('profile'),
    role: text('role', { enum: ['admin', 'user'] }).notNull()
})

export const session = sqliteTable('user_session', {
    id: text('id').primaryKey(),
    userId: text('user_id')
        .notNull()
        .references(() => user.id),
    activeExpires: blob('active_expires', {
        mode: 'bigint'
    }).notNull(),
    idleExpires: blob('idle_expires', {
        mode: 'bigint'
    }).notNull()
})

export const key = sqliteTable('user_key', {
    id: text('id').primaryKey(),
    userId: text('user_id')
        .notNull()
        .references(() => user.id),
    hashedPassword: text('hashed_password')
})

export const character = sqliteTable('character', {
    id: text('id').primaryKey().$defaultFn(createId),
    name: text('name').notNull(),
    introduction: text('introduction').notNull(),
    image: text('image'),
    instruction: text('instruction').notNull(),
    greeting: text('greeting').notNull(),
    creatorId: text('creator_id').references(() => user.id, {
        onDelete: 'cascade'
    })
})

export const room = sqliteTable(
    'room',
    {
        id: text('id').primaryKey().$defaultFn(createId),
        userId: text('user_id')
            .notNull()
            .references(() => user.id),
        characterId: text('character_id')
            .notNull()
            .references(() => character.id),
        active: text('active'),
        updatedAt: integer('updated_at').notNull().$defaultFn(Date.now)
    },
    (table) => {
        return {
            userCharacterIdx: index('user_charcter_id').on(
                table.userId,
                table.characterId
            ),
            activeIdx: index('active_idx').on(table.active)
        }
    }
)

export const conversation = sqliteTable('conversation', {
    id: text('id').primaryKey().$defaultFn(createId),
    roomId: text('room_id')
        .notNull()
        .references(() => room.id, {
            onDelete: 'cascade'
        }),
    createdAt: integer('created_at').notNull().$defaultFn(Date.now),
    updatedAt: integer('updated_at').notNull().$defaultFn(Date.now)
})

export const chat = sqliteTable('chat', {
    id: text('id').primaryKey().$defaultFn(createId),
    conversationId: text('conversation_id').references(() => conversation.id, {
        onDelete: 'cascade'
    }),
    role: text('role', { enum: ['user', 'assistant'] }).notNull(),
    content: text('content').notNull(),
    images: text('images'),
    createdAt: integer('created_at').notNull().$defaultFn(Date.now)
})

export const userRelations = relations(user, ({ many }) => ({
    rooms: many(room),
    characters: many(character)
}))

export const characterRelations = relations(character, ({ one }) => ({
    creator: one(user, {
        fields: [character.creatorId],
        references: [user.id]
    })
}))

export const roomRelations = relations(room, ({ one, many }) => ({
    character: one(character, {
        fields: [room.characterId],
        references: [character.id]
    }),
    conversations: many(conversation),
    user: one(user, {
        fields: [room.userId],
        references: [user.id]
    })
}))

export const conversationRelations = relations(
    conversation,
    ({ one, many }) => ({
        room: one(room, {
            fields: [conversation.roomId],
            references: [room.id]
        }),
        chats: many(chat)
    })
)

export const chatRelations = relations(chat, ({ one }) => ({
    conversation: one(conversation, {
        fields: [chat.conversationId],
        references: [conversation.id]
    })
}))

export const Table = {
    user,
    session,
    key,
    character,
    room,
    conversation,
    chat,
    userRelations,
    roomRelations,
    conversationRelations,
    chatRelations
} as const

export type Table = typeof Table
