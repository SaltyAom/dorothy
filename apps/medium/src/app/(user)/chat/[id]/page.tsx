'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'

import { Composer, Chat, Conversation } from '@modules/chat'
import { useCharacterId, useChat } from '@components/modules/chat/store'

export default function Chatroom() {
    const { id } = useParams()
    const [, setCharacterId] = useCharacterId()
    const { dispatch } = useChat()

    useEffect(() => {
        setCharacterId(Array.isArray(id) ? id[0] : id)

        return () => {
            setCharacterId(null)
            dispatch({ type: 'set', payload: [] })
        }
    }, [id])

    return (
        <section className="flex flex-col md:flex-row w-full min-h-screen">
            <Conversation />
            <main className="flex flex-col flex-1 max-w-2xl w-full mx-auto">
                <Chat />
                <Composer />
            </main>
        </section>
    )
}
