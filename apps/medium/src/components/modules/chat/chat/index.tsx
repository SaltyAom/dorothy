'use client'

import { useLayoutEffect } from 'react'

import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'

import Markdown from 'react-markdown'

import { easing } from '@services'
import { useUser } from '@stores'
import { useCharacter, useChat, useConversationId } from '../store'

import './chat.sass'

function PlaceholderMessages({
    image,
    greeted = false
}: {
    image?: string
    greeted?: boolean
}) {
    const { isUserLoading, user } = useUser()

    const CharacterImage = () =>
        image ? <img src={image!} alt="Profile" /> : <div className="image" />

    const { profile: userImage } = user ?? {}

    const UserImage = () =>
        !userImage || isUserLoading ? (
            <div className="image" />
        ) : (
            <img src={userImage ?? image ?? ''} alt="Profile" />
        )

    return (
        <>
            {!greeted && (
                <article className="chat -bot -loading">
                    <CharacterImage />
                    <section>
                        <div className="w-full h-48" />
                    </section>
                </article>
            )}
            <article className="chat -loading">
                <UserImage />
                <section>
                    <div className="w-3/4 h-16 -loading" />
                </section>
            </article>
            <article className="chat -bot -loading">
                <CharacterImage />
                <section>
                    <div className="w-full h-64 -loading" />
                </section>
            </article>
            <article className="chat -loading">
                <UserImage />
                <section>
                    <div className="w-1/2 h-16" />
                </section>
            </article>
        </>
    )
}

export default function Chat() {
    const { chats, isTyping, isChatLoading, chatError } = useChat()
    const { character, isCharacterLoading } = useCharacter()
    const { isUserLoading, user } = useUser()
    const [conversationId] = useConversationId()

    useLayoutEffect(() => {
        requestAnimationFrame(() => {
            window.scrollTo(
                0,
                document.getElementsByClassName('page')[0]?.clientHeight ??
                    document.body.clientHeight
            )
        })
    }, [chats.length])

    if (!isChatLoading && !character) return 'Something went wrong.'

    const { profile: userImage } = user ?? {}
    const { name, image = '', greeting } = character ?? {}

    return (
        <AnimatePresence>
            <motion.section
                key={
                    (conversationId ?? 'unknown') +
                    '_' +
                    (isChatLoading ? 'loading' : 'active')
                }
                className="flex flex-col flex-1 gap-1 w-full pt-0 md:pt-4 p-4 overflow-x-hidden overflow-y-auto"
                initial={{
                    opacity: 0,
                    translateY: 36
                }}
                animate={{
                    opacity: 1,
                    translateY: 0
                }}
                transition={{
                    duration: 0.3,
                    ease: easing.outQuint
                }}
            >
                {!isChatLoading && (
                    <article className="chat -bot">
                        <img src={image!} alt={name} />
                        <section>
                            <div>
                                <Markdown>{greeting}</Markdown>
                            </div>
                        </section>
                    </article>
                )}
                {isChatLoading ? (
                    <PlaceholderMessages image={image!} />
                ) : (
                    chats.map(({ id, role, content, images }, index) => (
                        <article
                            key={index}
                            className={`chat ${
                                role === 'assistant' ? '-bot' : ''
                            }`}
                        >
                            {role === 'user' ? (
                                isUserLoading ? (
                                    <div className="image" />
                                ) : (
                                    <img
                                        src={userImage ?? image ?? ''}
                                        alt="Profile"
                                    />
                                )
                            ) : (
                                <img src={image!} alt={name} />
                            )}
                            <section>
                                {!!images?.length && (
                                    <section className="flex flex-col items-end gap-2 p-2">
                                        {images?.map((image) => (
                                            <img
                                                key={image}
                                                src={image}
                                                className="max-h-96 rounded-2xl object-contain object-center"
                                            />
                                        ))}
                                    </section>
                                )}
                                {!!content && (
                                    <div className="flex flex-col max-w-full gap-1">
                                        <Markdown>{content}</Markdown>
                                    </div>
                                )}
                            </section>
                        </article>
                    ))
                )}
                {isTyping && (
                    <article className="chat -bot">
                        <img src={image!} alt={name} />
                        <section>
                            <div>
                                <span className="loading loading-dots loading-sm translate-y-1 text-current" />
                            </div>
                        </section>
                    </article>
                )}
                {chatError && (
                    <article className="chat -bot">
                        <img src={image!} alt={name} />
                        <section>
                            <div className="!text-amber-700 !bg-amber-50 font-medium">
                                <Markdown>{chatError}</Markdown>
                            </div>
                        </section>
                    </article>
                )}
            </motion.section>
        </AnimatePresence>
    )
}
