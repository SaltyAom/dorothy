'use client'

import { Fragment, type PropsWithChildren } from 'react'

import { Provider as JotaiProvider, createStore } from 'jotai'

import {
    QueryClientProvider,
    QueryClient,
    QueryPersister
} from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

import { isServer } from '@services'
import { usePathname } from 'next/navigation'

import { motion, AnimatePresence } from 'framer-motion'
import { FrozenRouter } from './transition'

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

const jotaiStore = createStore()

export default function Provider({ children }: PropsWithChildren) {
    const pathname = usePathname()

    return (
        <JotaiProvider store={jotaiStore}>
            <PersistQueryClientProvider
                client={queryClient}
                persistOptions={{
                    persister
                }}
            >
                <AnimatePresence initial={false}>
                    <motion.div
                        key={pathname}
                        className="page"
                        initial={{
                            left: '100%',
                            zIndex: 10,
                            overflow: 'hidden'
                        }}
                        animate={{
                            left: 0,
                            zIndex: 10,
                            overflow: 'unset',
                            transition: {
                                delay: 0.05
                            }
                        }}
                        exit={{
                            overflow: 'hidden',
                            left: '-30%',
                            transition: {
                                delay: 0.05
                            }
                        }}
                        transition={{
                            when: 'afterChildren',
                            duration: 0.4,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                    >
                        <FrozenRouter>{children}</FrozenRouter>
                    </motion.div>
                </AnimatePresence>
            </PersistQueryClientProvider>
        </JotaiProvider>
    )
}
