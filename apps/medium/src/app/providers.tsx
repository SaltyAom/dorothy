'use client'

import type { PropsWithChildren } from 'react'

import { Provider as JotaiProvider } from 'jotai'

import {
    QueryClientProvider,
    QueryClient,
    QueryPersister
} from '@tanstack/react-query'

import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const queryClient = new QueryClient()

export default function Provider({ children }: PropsWithChildren) {
    return (
        <JotaiProvider>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </JotaiProvider>
    )
}
