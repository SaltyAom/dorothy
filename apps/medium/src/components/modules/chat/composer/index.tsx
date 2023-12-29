'use client'
import { useEffect } from 'react'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

import { useChat } from '../store'

import { resonator } from '@services'
import { Textarea } from '@shared'

const model = z.object({
    parts: z.string()
})

type model = z.infer<typeof model>

export default function Composer() {
    const { dispatch, isTyping, chats } = useChat()

    const {
        handleSubmit,
        register,
        reset: resetForm
    } = useForm<model>({
        resolver: zodResolver(model)
    })

    useEffect(() => {
        document
            .getElementById('composer')
            ?.setAttribute('data-replicated-value', ' ')
    }, [chats.length])

    return (
        <div className="sticky bottom-4 w-full px-4 mt-4">
            <form
                className="flex items-center text-lime-800 bg-lime-100 p-1.5 rounded-2xl md:focus-within:ring ring-lime-200 transition-all overflow-x-hidden"
                onSubmit={handleSubmit(({ parts }) => {
                    resetForm()
                    dispatch({
                        type: 'add',
                        payload: parts
                    })
                })}
                onKeyDown={(event) => {
                    if (
                        event.key === 'Enter' &&
                        (event.shiftKey || event.ctrlKey || event.metaKey)
                    ) {
                        event.preventDefault()
                        ;(
                            event.currentTarget as HTMLFormElement
                        ).requestSubmit()
                    }
                }}
            >
                <Textarea
                    id="composer"
                    className="flex flex-1 text-lg bg-transparent placeholder-lime-700 border-none border-transparent focus:border-transparent focus:ring-0 whitespace-prewrap"
                    placeholder="Type a message"
                    inputMode="text"
                    autoFocus
                    {...register('parts')}
                />
                <button
                    type="submit"
                    className="flex justify-center items-center w-10 h-10 rounded-xl text-lime-700 hover:bg-lime-300/75 focus:bg-lime-300/75 transition-colors"
                    disabled={isTyping}
                >
                    {isTyping ? (
                        <span className="loading loading-spinner text-current" />
                    ) : (
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
                        >
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    )}
                </button>
            </form>
        </div>
    )
}
