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

import { isServer, easing, useScreenSize } from '@services'
import { usePathname } from 'next/navigation'

import { motion, AnimatePresence } from 'framer-motion'
import { FrozenRouter } from './transition'

export const persister = createSyncStoragePersister({
    storage: isServer ? undefined : window.localStorage
})

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 0,
            gcTime: 24 * 60 * 60 * 1000
        }
    }
})

const jotaiStore = createStore()

export default function Provider({ children }: PropsWithChildren) {
    const pathname = usePathname()
    const { width } = useScreenSize()

    const isBig = width > 1024

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
                            left: isBig ? '5%' : '100%',
                            opacity: isBig ? 0 : 1,
                            zIndex: 10,
                            overflow: 'hidden'
                        }}
                        animate={{
                            left: 0,
                            zIndex: 10,
                            opacity: 1,
                            overflow: 'unset',
                            transition: {
                                delay: 0.05
                            }
                        }}
                        exit={{
                            overflow: 'hidden',
                            left: isBig ? '-5%' : '-30%',
                            transition: {
                                delay: 0.05
                            }
                        }}
                        transition={{
                            when: 'afterChildren',
                            duration: isBig ? 0.2 : 0.425,
                            ease: easing.outQuint
                        }}
                    >
                        <FrozenRouter>{children}</FrozenRouter>
                    </motion.div>
                </AnimatePresence>
            </PersistQueryClientProvider>
        </JotaiProvider>
    )
}
