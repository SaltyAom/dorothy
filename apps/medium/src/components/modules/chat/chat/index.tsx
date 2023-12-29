'use client'

import { useLayoutEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

import Markdown from 'react-markdown'

import { useUser } from '@stores'
import { useCharacter, useChat } from '../store'

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
                <article className="chat -bot">
                    <CharacterImage />
                    <div className="w-full h-48" />
                </article>
            )}
            <article className="chat">
                <UserImage />
                <div className="w-3/4 h-16" />
            </article>
            <article className="chat -bot">
                <CharacterImage />
                <div className="w-full h-64" />
            </article>
            <article className="chat">
                <UserImage />
                <div className="w-1/2 h-16" />
            </article>
        </>
    )
}

export default function Chat() {
    const { chats, isTyping, isChatLoading, chatError } = useChat()
    const { character, isCharacterLoading } = useCharacter()
    const { isUserLoading, user } = useUser()

    useLayoutEffect(() => {
        requestAnimationFrame(() => {
            window.scrollTo(0, document.body.scrollHeight)
        })
    }, [chats.length])

    if (isCharacterLoading)
        return (
            <section className="flex flex-col flex-1 gap-1 w-full pt-0 md:pt-4 p-4 overflow-x-hidden overflow-y-auto opacity-75">
                <PlaceholderMessages />
            </section>
        )

    if (!character) return 'Something went wrong.'

    const { profile: userImage } = user ?? {}
    const { name, image = '', greeting } = character

    return (
        <section className="flex flex-col flex-1 gap-1 w-full pt-0 md:pt-4 p-4 overflow-x-hidden overflow-y-auto">
            {!isChatLoading && (
                <article className="chat -bot">
                    <img src={image!} alt={name} />
                    <div>
                        <Markdown>{greeting}</Markdown>
                    </div>
                </article>
            )}
            {isChatLoading ? (
                <PlaceholderMessages image={image!} />
            ) : (
                chats.map(({ role, content }, index) => (
                    <article
                        key={index}
                        className={`chat ${role === 'assistant' ? '-bot' : ''}`}
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
                        <div>
                            <Markdown>{content}</Markdown>
                        </div>
                    </article>
                ))
            )}
            {isTyping && (
                <article className="chat -bot">
                    <img src={image!} alt={name} />
                    <div>
                        <span className="loading loading-dots loading-sm translate-y-1 text-current" />
                    </div>
                </article>
            )}
            {chatError && (
                <article className="chat -bot">
                    <img src={image!} alt={name} />
                    <div className="!text-amber-700 !bg-amber-50 font-medium">
                        <Markdown>{chatError}</Markdown>
                    </div>
                </article>
            )}
        </section>
    )
}
