import { useEffect, useRef, useState } from 'react'

import { atom, useAtom } from 'jotai'

import {
    useIsMutating,
    useMutation,
    useQuery,
    useQueryClient
} from '@tanstack/react-query'

import { resonator } from '@services'
import { queryClient } from '@app/providers'

export const characterIdAtom = atom<string | null>(null)
export const useCharacterId = () => useAtom(characterIdAtom)

export type Character = NonNullable<
    Awaited<ReturnType<resonator['character'][':id']['get']>>['data']
>

export const characterAtom = atom<Character | null>(null)
export const useCharacter = () => {
    const [id] = useCharacterId()

    const {
        data: character,
        error,
        isPending
    } = useQuery({
        queryKey: ['character', id],
        staleTime: Infinity,
        async queryFn() {
            const { data, error } = await resonator.character[id!].get()

            if (error) throw error

            return data
        },
        enabled: !!id
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
        data: conversationList,
        isLoading: isConversationLoading,
        refetch: refetchConversations
    } = useQuery({
        queryKey: ['conversation', 'list', characterId],
        staleTime: Infinity,
        async queryFn() {
            const { data, error } =
                await resonator.character[characterId!].chat.list.get()

            if (error) throw error

            return data
        },
        enabled: !!characterId
    })

    useEffect(() => {
        setConversationId(conversationList?.active ?? null)
    }, [conversationList])

    const { mutate: newConversation, isPending: isCreatingNewConversation } =
        useMutation({
            mutationKey: ['conversation', 'new', characterId],
            async mutationFn() {
                if (!characterId) throw new Error('Missing character id')

                const { data: conversationId, error } =
                    await resonator.character[characterId].chat.list.put()

                if (error) throw error

                queryClient.invalidateQueries({
                    refetchType: 'none',
                    queryKey: ['conversation', 'list', characterId]
                })

                await refetchConversations()
            }
        })

    const dispatch = (action: ConversationActions) => {
        queryClient.invalidateQueries({
            refetchType: 'none',
            queryKey: [
                'chat',
                {
                    characterId,
                    conversationId: null
                }
            ]
        })

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
        ...conversationList,
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
          payload: {
              content: string
              images?: File[]
          }
      }
    | {
          type: 'set'
          payload: Chat[] | ((chats: Chat[]) => Chat[])
      }

const chatAtom = atom<Chat[]>([])
const chatErrorAtom = atom<string | null>(null)
export const useChat = () => {
    const [characterId] = useCharacterId()
    const [chats, setChat] = useAtom(chatAtom)
    const [conversationId] = useConversationId()

    const queryClient = useQueryClient()

    const {
        data: networkChat,
        isFetching,
        isPending
    } = useQuery({
        queryKey: [
            'chat',
            {
                characterId,
                conversationId
            }
        ],
        staleTime: Infinity,
        async queryFn() {
            const { data, error } = await resonator.character[
                characterId!
            ].chat.get({
                $query: {
                    conversation: conversationId ?? ''
                }
            })

            if (error) throw error

            return data
        },
        enabled: !!characterId
    })

    useEffect(() => {
        if (networkChat) setChat(networkChat)
    }, [networkChat])

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
        mutationFn: async ({
            content,
            images
        }: {
            content: string
            images?: File[]
        }) => {
            setChatError(null)

            if (!characterId) throw new Error('Missing character id')

            const { data, error } = await resonator.character[
                characterId
            ].chat.post({
                conversationId: conversationId ? conversationId : undefined,
                content,
                images: images?.length ? images : undefined,
                time: new Date().toString()
            })

            queryClient.invalidateQueries({
                refetchType: 'none',
                queryKey: [
                    'chat',
                    {
                        characterId,
                        conversationId
                    }
                ]
            })
            queryClient.invalidateQueries({
                refetchType: 'active',
                queryKey: ['conversation', 'list', characterId]
            })

            if (error) throw error

            setChat((chats) => {
                const newChats = [
                    ...chats,
                    {
                        id: Date.now().toString(),
                        role: 'assistant',
                        content: data.content,
                        createdAt: Date.now(),
                        images: undefined
                    } satisfies Chat
                ] as Chat[]

                return newChats as any
            })
        },
        onError(error) {
            const message = // @ts-ignore
                (error?.value ?? error.message ?? `${error}`).replace(
                    '[GoogleGenerativeAI Error]: ',
                    ''
                )

            setChatError(message)
        },
    })

    const dispatch = async (action: ChatActions) => {
        switch (action.type) {
            case 'add':
                const { content, images } = action.payload

                const tempImages = await fileListToBase64(images)

                sendMessage(action.payload)
                setChat((chats) => [
                    ...chats,
                    {
                        id: Date.now().toString(),
                        content,
                        images: tempImages,
                        role: 'user',
                        createdAt: Date.now(),
                        conversationId: conversationId!
                    }
                ])
                break

            case 'set':
                setChat(action.payload)
                break
        }
    }

    return {
        chats,
        isChatLoading: isFetching || isPending,
        isTyping,
        dispatch,
        chatError
    }
}

export const fileListToBase64 = async (files?: FileList | File[] | null) => {
    if (!files) return

    const images: Promise<string>[] = []

    for (let i = 0; i < files.length; i++) {
        const file = files[i]

        const reader = new FileReader()
        reader.readAsDataURL(file)

        images.push(
            new Promise((resolve) => {
                reader.onload = () => {
                    resolve(reader.result as string)
                }
            })
        )
    }

    return Promise.all(images)
}
