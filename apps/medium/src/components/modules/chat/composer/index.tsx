'use client'

import { useEffect, useRef, useState } from 'react'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { fileListToBase64, useChat } from '../store'

import { Textarea } from '@shared'

const model = z.object({
    content: z.string(),
    // It should be .instanceOf(FileList) but is undefined for some reason
    images: z.any().optional()
})

type model = z.infer<typeof model>

export default function Composer() {
    const { dispatch, isTyping, chats } = useChat()
    const [previewImages, setPreviewImages] = useState<string[] | undefined>(
        undefined
    )

    const inputImageRef = useRef<HTMLInputElement | null>(null)

    const {
        handleSubmit,
        register,
        reset: resetForm,
        setValue
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
                className="flex flex-col text-lime-800 bg-lime-100 p-1.5 rounded-2xl transition-all overflow-x-hidden"
                onSubmit={handleSubmit(({ content, images }) => {
                    dispatch({
                        type: 'add',
                        payload: {
                            content,
                            images: images ? Array.from(images) : undefined
                        }
                    })

                    resetForm()
                    setPreviewImages(undefined)
                })}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        if (event.shiftKey || event.ctrlKey || event.metaKey) {
                        } else {
                            ;(
                                event.currentTarget as HTMLFormElement
                            ).requestSubmit()
                        }
                    }
                }}
            >
                <input
                    ref={inputImageRef}
                    type="file"
                    multiple
                    accept="image/jpeg, image/png, image/heic, image/webp"
                    hidden
                    className="hidden"
                    onChange={async (event) => {
                        if (!event.target.files) return

                        setValue('images', event.target.files)
                        setPreviewImages(
                            await fileListToBase64(event.target.files)
                        )
                    }}
                />
                {!!previewImages?.length && (
                    <section className="flex items-center w-full p-2">
                        {previewImages?.map((image) => (
                            <img
                                key={image}
                                src={image}
                                className="h-16 mr-2 rounded-xl"
                            />
                        ))}
                    </section>
                )}
                <section className="flex items-center w-full">
                    <button
                        className="flex justify-center items-center w-10 h-10 rounded-xl text-lime-700 transition-colors"
                        type="button"
                        onClick={() => {
                            inputImageRef.current?.click()
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
                            className="feather feather-image"
                        >
                            <rect
                                x="3"
                                y="3"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                            />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                    </button>
                    <Textarea
                        id="composer"
                        className="flex flex-1 text-lg bg-transparent placeholder-lime-700 border-none border-transparent focus:border-transparent focus:ring-0 whitespace-prewrap"
                        placeholder="Type a message"
                        inputMode="text"
                        required
                        {...register('content')}
                    />
                    <button
                        type="submit"
                        className="flex justify-center items-center w-10 h-10 rounded-xl text-lime-700 transition-colors"
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
                </section>
            </form>
        </div>
    )
}
