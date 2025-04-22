'use client'

import { use } from 'react'

import { HydrationBoundary, dehydrate, isServer } from '@tanstack/react-query'
import { resonator } from '@services'

import { queryClient } from '@app/providers'
import { Composer, Chat, Conversation } from '@modules/chat'
import CleanUp from './clean-up'

export default function Chatroom({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)

    if (!isServer)
        queryClient.prefetchQuery({
            queryKey: ['character', id],
            async queryFn() {
                const { data, error } = await resonator.character({ id }).get()

                if (error) throw error

                return data
            }
        })

    return (
        <>
            <CleanUp characterId={id} />
            <section className="flex flex-col md:flex-row w-full min-h-screen">
                <HydrationBoundary state={dehydrate(queryClient)}>
                    <Conversation />
                    <main className="flex flex-col flex-1 max-w-2xl w-full mx-auto">
                        <Chat />
                        <Composer />
                    </main>
                </HydrationBoundary>
            </section>
        </>
    )
}
