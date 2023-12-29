'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { resonator } from '@services'
import {
    useCharacter,
    useChat,
    useConversation,
    useConversationId
} from '../store'
import { useUser } from '@stores'

export default function Conversation() {
    const { character, isCharacterLoading } = useCharacter()
    const [conversationId] = useConversationId()
    const [active] = useConversationId()
    const {
        conversations,
        isConversationLoading,
        isCreatingNewConversation,
        dispatch
    } = useConversation()

    const { user, isUserLoading } = useUser()

    const [showMobileSidebar, setShowMobileSidebar] = useState(false)

    useEffect(() => {
        setShowMobileSidebar(false)
    }, [conversationId])

    return (
        <>
            <nav className="flex sticky top-0 justify-start items-center md:hidden gap-2 h-16 p-2 text-lime-800 bg-muelsyse">
                <button
                    className="p-2"
                    onClick={() => setShowMobileSidebar(true)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="feather feather-menu"
                    >
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
                <h1 className="text-2xl font-semibold capitalize">
                    {character?.name}
                </h1>
            </nav>
            <aside
                className={`z-50 fixed top-0 md:sticky xl:fixed ${
                    showMobileSidebar ? 'flex' : 'hidden'
                } md:flex flex-col items-start w-full md:max-w-xs px-4 bg-muelsyse md:bg-transparent min-h-screen h-screen max-h-screen overflow-y-auto`}
            >
                <header className="sticky top-0 flex flex-col items-start bg-muelsyse w-full pt-4">
                    <div className="flex justify-between items-center w-full py-3 text-lime-900">
                        {isCharacterLoading ? (
                            <h1 className="text-3xl font-semibold capitalize ml-3 w-56 h-9 rounded bg-lime-100" />
                        ) : (
                            <Link href="/chat">
                                <h1 className="text-3xl font-semibold capitalize ml-3 select-none drag-none">
                                    {isCharacterLoading
                                        ? 'Loading...'
                                        : character?.name}
                                    <sup className="font-light text-amber-500">
                                        PRTS
                                    </sup>
                                </h1>
                            </Link>
                        )}
                        <button
                            className="md:hidden p-3"
                            onClick={() => {
                                setShowMobileSidebar(false)
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="feather feather-x scale-125"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                    <button
                        disabled={isConversationLoading}
                        className="flex justify-start items-center gap-2 text-left text-lg text-amber-800 mt-2 mb-4 py-3 pl-6 pr-8 bg-amber-100 hover:bg-amber-200 focus:bg-amber-200 rounded-full transition-colors select-none drag-none"
                        onClick={() => {
                            dispatch({
                                type: 'new'
                            })
                            setShowMobileSidebar(false)
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="feather feather-plus"
                        >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        New Chat
                    </button>
                </header>

                <ul className="flex flex-col flex-1 gap-1 w-full select-none pb-4">
                    {isCreatingNewConversation && (
                        <section>
                            <button
                                role="listitem"
                                disabled
                                className="text-left text-lg text-lime-800 text-ellipsis whitespace-nowrap overflow-hidden w-full py-3 px-6 rounded-full transition-colors opacity-75 bg-lime-100 cursor-not-allowed"
                            >
                                New Chat
                            </button>
                        </section>
                    )}
                    {isConversationLoading ? (
                        <section className="flex gap-1">
                            {/* <button
                                role="listitem"
                                disabled
                                className="text-left text-lg text-lime-800 text-ellipsis whitespace-nowrap overflow-hidden w-full py-3 px-6 rounded-2xl bg-lime-100/70 h-96"
                            /> */}
                        </section>
                    ) : conversations ? (
                        conversations.map(({ id, chats }) => (
                            <section key={id} className="flex gap-1">
                                <button
                                    role="listitem"
                                    onClick={() => {
                                        dispatch({
                                            type: 'set',
                                            payload: id
                                        })
                                    }}
                                    className={`text-left text-lg text-lime-800 text-ellipsis whitespace-nowrap overflow-hidden w-full py-3 px-6 ${
                                        id === active ? 'bg-lime-100' : ''
                                    } hover:bg-lime-200 focus:bg-lime-200 rounded-full transition-colors`}
                                >
                                    {chats[0]?.content ?? 'New Chat'}
                                </button>
                            </section>
                        ))
                    ) : null}
                </ul>

                <footer className="sticky bottom-0 w-full bg-muelsyse pb-4">
                    {!user?.username || isUserLoading ? (
                        <article className="flex items-center gap-3 w-full p-2 rounded-full transition-colors select-none drag-none">
                            <div className="size-12 rounded-full bg-amber-100" />
                            <h3 className="text-amber-700 text-xl font-medium inline-block w-48 h-6 bg-amber-100 rounded" />
                        </article>
                    ) : (
                        <article className="sticky bottom-0 flex items-center gap-3 w-full p-2 hover:bg-amber-100 focus:bg-amber-100 rounded-full transition-colors select-none drag-none">
                            <img
                                className="size-12 rounded-full"
                                src={user?.profile ?? character?.image ?? ''}
                            />
                            <h3 className="text-amber-700 text-xl font-medium">
                                {user?.username}
                            </h3>
                        </article>
                    )}
                </footer>
            </aside>
        </>
    )
}
