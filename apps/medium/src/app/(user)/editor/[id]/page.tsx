'use client'

import { useParams, useRouter } from 'next/navigation'
import { Textarea } from '@shared'

import { useCharacterEditor } from './store'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function CharacterEditorPage({
    type = 'edit'
}: {
    type: 'new' | 'edit'
}) {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()

    const {
        character,
        error,
        register,
        handleSubmit,
        edit,
        create,
        isCreating,
        isEditing,
        isCharacterLoading,
        recentCharacter,
        formError,
        setValue
    } = useCharacterEditor(id)

    const isProcessing = isCreating || isEditing

    const [preview, setPreview] = useState<string | null>(null)

    useEffect(() => {
        if (recentCharacter) router.replace(`/editor/${recentCharacter.id}`)
    }, [recentCharacter])

    if (error) return <h1>Not Found</h1>

    const { name, image, greeting, introduction, instruction } = character ?? {}

    return (
        <form
            className="flex flex-col md:flex-row max-w-5xl gap-6 w-full mx-auto p-4 md:py-8"
            onSubmit={handleSubmit((data) =>
                type === 'edit' ? edit(data) : create(data)
            )}
        >
            <aside className="flex flex-col items-center gap-2 md:max-w-60 xl:max-w-64 w-full">
                <input
                    type="file"
                    accept="image/*"
                    alt={name}
                    hidden
                    className="hidden"
                    id="character-editor-image"
                    onChange={(event) => {
                        const file = event.target.files?.[0]

                        if (!file) return

                        setValue('image', file)

                        if (file) {
                            const reader = new FileReader()
                            reader.onload = (event) => {
                                const result = event.target?.result

                                if (result) setPreview(result?.toString())
                            }
                            reader.readAsDataURL(file)
                        }
                    }}
                />
                {!isCharacterLoading ? (
                    <button
                        className="relative size-24 rounded-full mb-2 bg-lime overflow-hidden"
                        type="button"
                        onClick={() => {
                            document
                                .getElementById('character-editor-image')
                                ?.click()
                        }}
                    >
                        <div className="absolute z-10 flex justify-center items-center size-24 bg-black/40 opacity-0 hover:opacity-100 focus:opacity-100 rounded-full transition-opacity text-amber-400">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="3"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                className="feather feather-upload transform scale scale-125"
                            >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </div>
                        {preview || image ? (
                            <img
                                src={preview ?? image ?? ''}
                                alt={name}
                                className="size-24 rounded-full object-fit object-cover"
                            />
                        ) : (
                            <div className="size-24 rounded-full bg-lime-100" />
                        )}
                    </button>
                ) : (
                    <button
                        className="relative size-24 rounded-full mb-2 bg-lime-100 overflow-hidden"
                        type="button"
                        disabled
                    >
                        <div className="size-24 rounded-full" />
                    </button>
                )}
                <input
                    {...register('name')}
                    className="text-2xl text-lime-800 placeholder-lime-700 font-medium border-0 rounded-xl text-center w-full bg-transparent hover:bg-lime-100 focus:bg-lime-100 transition-colors focus:border-transparent focus:ring-0"
                    placeholder="Name"
                    defaultValue={name}
                />
                <Textarea
                    {...register('introduction')}
                    className="text-lg text-lime-800 placeholder-lime-700 w-full p-2 px-3 rounded-xl border-0 bg-transparent hover:bg-lime-100 focus:bg-lime-100 transition-colors focus:border-transparent focus:ring-0"
                    placeholder="Introduction"
                    rows={6}
                    defaultValue={introduction ?? ''}
                />

                <button
                    disabled={isProcessing || isCharacterLoading}
                    className="flex items-center gap-2 text-center text-lg text-amber-800 py-3 pl-6 pr-8 bg-amber-100 hover:bg-amber-200 focus:bg-amber-200 rounded-full transition-colors select-none drag-none w-full"
                >
                    <p className="mx-auto">
                        {type === 'edit' ? 'Save' : 'Create'}
                        {isProcessing ? (
                            <span className="absolute ml-2 loading loading-spinner" />
                        ) : null}
                    </p>
                </button>
                <Link
                    href="/editor"
                    className="flex items-center gap-2 text-center text-lg text-amber-800 py-3 pl-6 pr-8 hover:bg-amber-200 focus:bg-amber-200 rounded-full transition-colors select-none drag-none w-full"
                >
                    <p className="mx-auto">
                        Editor
                    </p>
                </Link>
            </aside>
            <section className="flex flex-col gap-2 w-full">
                <h2 className="text-xl font-medium text-lime-800 px-3">
                    Greeting
                </h2>
                <Textarea
                    {...register('greeting')}
                    className="text-lg text-lime-800 placeholder-lime-700 w-full p-2 px-3 rounded-xl border-0 bg-transparent hover:bg-lime-100 focus:bg-lime-100 transition-colors focus:border-transparent focus:ring-0"
                    placeholder="Greeting"
                    required
                    rows={5}
                    defaultValue={greeting}
                />

                <h2 className="text-xl font-medium text-lime-800 px-3 mt-3">
                    Instruction
                </h2>

                <Textarea
                    className="text-lg text-lime-800 placeholder-lime-700 w-full p-2 px-3 rounded-xl border-0 bg-transparent hover:bg-lime-100 focus:bg-lime-100 transition-colors focus:border-transparent focus:ring-0"
                    {...register('instruction')}
                    placeholder="Instruction"
                    rows={16}
                    required
                    defaultValue={instruction}
                />
            </section>
        </form>
    )
}
