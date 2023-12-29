import { useEffect, useRef, useState } from 'react'

import { atom, useAtom } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'

import { useIsMutating, useMutation, useQuery } from '@tanstack/react-query'
import { QueryCache } from '@tanstack/react-query'

import { resonator } from '@services'
import { LRUCache } from 'lru-cache'

export const characterIdAtom = atom<string | null>(null)
export const useCharacterId = () => useAtom(characterIdAtom)
export const hydrateCharacterId = (id: string) =>
    useHydrateAtoms([[characterIdAtom, id]])

export type Character = NonNullable<
    Awaited<ReturnType<resonator['character'][':id']['get']>>['data']
>

const cache = new QueryCache()

export const characterAtom = atom<Character | null>(null)
export const useCharacter = () => {
    const [id] = useCharacterId()

    const {
        data: character,
        error,
        isPending
    } = useQuery({
        queryKey: ['character', id],
        queryFn: async () => {
            const { data, error } = await resonator.character[id!].get()

            if (error) throw error

            return data
        },
        enabled: id !== null
    })

    return { character, error, isCharacterLoading: isPending }
}

export type Conversation = NonNullable<
    Awaited<
        ReturnType<resonator['character'][':id']['chat']['list']['get']>
    >['data']
>

type ConversationActions =
    | {
          type: 'set'
          payload: string
      }
    | {
          type: 'new'
      }

export const conversationIdAtom = atom<string | null>(null)
export const useConversationId = () => useAtom(conversationIdAtom)

export const conversationAtom = atom<Conversation | null>(null)

export const useConversation = () => {
    const [characterId] = useCharacterId()
    const [conversation, setConversation] = useAtom(conversationAtom)
    const [conversationId, setConversationId] = useConversationId()

    useEffect(() => {
        setConversationId(null)
    }, [characterId])

    const {
        data,
        isLoading: isConversationLoading,
        refetch: refetchConversations
    } = useQuery({
        queryKey: ['conversation', 'list', characterId],
        async queryFn() {
            const { data, error } =
                await resonator.character[characterId!].chat.list.get()

            if (error) throw error

            setConversationId(data?.active ?? null)

            return data
        },
        enabled: characterId !== null
    })

    const { mutate: newConversation, isPending: isCreatingNewConversation } =
        useMutation({
            mutationKey: ['conversation', 'new', characterId],
            async mutationFn() {
                if (!characterId) throw new Error('Missing character id')

                const { data: conversationId, error } =
                    await resonator.character[characterId].chat.list.put()

                if (error) throw error

                chatCache.set(characterId! + conversationId!, [])

                await refetchConversations()
            }
        })

    const dispatch = (action: ConversationActions) => {
        switch (action.type) {
            case 'set':
                setConversationId(action.payload)
                break

            case 'new':
                setConversationId(null)
                newConversation()
                break
        }
    }

    return {
        ...data,
        isConversationLoading,
        isCreatingNewConversation,
        dispatch
    }
}

export type Chat = NonNullable<
    Awaited<ReturnType<resonator['character'][':id']['chat']['get']>>['data']
>[0]

type ChatActions =
    | {
          type: 'add'
          payload: string
      }
    | {
          type: 'set'
          payload: Chat[] | ((chats: Chat[]) => Chat[])
      }

const chatCache = new LRUCache<string, Chat[]>({
    max: 100
})

const chatAtom = atom<Chat[]>([])
const chatErrorAtom = atom<string | null>(null)
export const useChat = () => {
    const [characterId] = useCharacterId()
    const [chats, setChat] = useAtom(chatAtom)
    const [conversationId] = useConversationId()

    const initialized = useRef(false)

    const { data: _, isFetching: isChatLoading } = useQuery({
        queryKey: ['chat', { characterId, conversationId }],
        async queryFn() {
            if (!initialized.current && conversationId) {
                initialized.current = true

                return chats
            }

            if (conversationId) {
                const cache = chatCache.get(characterId! + conversationId)

                if (cache) {
                    setChat(cache)
                    return cache
                }
            }

            const { data, error } = await resonator.character[
                characterId!
            ].chat.get({
                $query: {
                    conversation: conversationId ?? ''
                }
            })

            if (error) throw error

            setChat(data)
            chatCache.set(characterId! + conversationId!, data)

            return data
        },
        enabled: characterId !== null
    })

    const isTyping =
        useIsMutating({
            mutationKey: ['chat', 'add', characterId, chats.length]
        }) !== 0

    const [chatError, setChatError] = useAtom(chatErrorAtom)

    useEffect(() => {
        setChatError(null)
    }, [conversationId])

    const { mutate: sendMessage, data: response } = useMutation({
        mutationKey: ['chat', 'add', characterId, chats.length],
        onError(error) {
            const message = // @ts-ignore
                (error?.value ?? error.message ?? `${error}`).replace(
                    '[GoogleGenerativeAI Error]: ',
                    ''
                )

            setChatError(message)
        },
        mutationFn: async (content: string) => {
            setChatError(null)

            if (!characterId) throw new Error('Missing character id')

            const { data, error } = await resonator.character[
                characterId
            ].chat.post({
                content,
                time: new Date().toString()
            })

            if (error) throw error

            setChat((chats) => {
                const newChats = [
                    ...chats,
                    {
                        role: 'assistant',
                        content: data
                    }
                ] as Chat[]

                if (conversationId)
                    chatCache.set(
                        characterId! + conversationId,
                        newChats as any
                    )

                return newChats as any
            })
        }
    })

    const dispatch = (action: ChatActions) => {
        switch (action.type) {
            case 'add':
                setChat((chats) => [
                    ...chats,
                    {
                        id: Date.now().toString(),
                        content: action.payload,
                        role: 'user',
                        createdAt: Date.now(),
                        conversationId: conversationId!
                    }
                ])
                sendMessage(action.payload)
                break

            case 'set':
                setChat(action.payload)
                break
        }
    }

    return {
        chats,
        isChatLoading,
        isTyping,
        dispatch,
        chatError
    }
}
