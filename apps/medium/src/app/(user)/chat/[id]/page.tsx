import { useEffect } from 'react'
import { useParams } from 'next/navigation'

import {
    HydrationBoundary,
    QueryClient,
    dehydrate
} from '@tanstack/react-query'

import { queryClient } from '@app/providers'
import { Composer, Chat, Conversation } from '@modules/chat'
import CleanUp from './clean-up'

import { isServer, resonator } from '@services'
import { useHydrateAtoms } from '@stores/jotai'
import { characterIdAtom } from '@components/modules/chat/store'

export default async function Chatroom({
    params: { id }
}: {
    params: { id: string }
}) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                networkMode: 'offlineFirst'
            }
        }
    })

    await queryClient.prefetchQuery({
        queryKey: ['character', id],
        async queryFn() {
            const { data, error } = await resonator.character[id!].get()

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
