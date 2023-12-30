'use client'

import type { PropsWithChildren } from 'react'

import { Provider as JotaiProvider } from 'jotai'

import {
    QueryClientProvider,
    QueryClient,
    QueryPersister
} from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

import { isServer } from '@services'

const persister = createSyncStoragePersister({
    storage: isServer ? undefined : window.localStorage
})

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            networkMode: 'offlineFirst'
        }
    }
})

export default function Provider({ children }: PropsWithChildren) {
    return (
        <JotaiProvider>
            <PersistQueryClientProvider
                client={queryClient}
                persistOptions={{
                    persister
                }}
            >
                {children}
            </PersistQueryClientProvider>
        </JotaiProvider>
    )
}
