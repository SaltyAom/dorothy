'use client'

import Link from 'next/link'

import { useEditorList } from '@stores/editor'

export default function Page() {
    const { characters, isEditorLoading } = useEditorList()

    return (
        <main className="flex flex-col max-w-6xl w-full min-h-screen mx-auto p-4 md:py-8 select-none drag-none">
            <header className="flex items-center gap-2">
                <Link
                    className="flex justify-center items-center size-12 text-lime-700 hover:bg-lime-100 focus:bg-lime-100 hover:text-lime-700 focus:text-lime-700 transition-colors rounded-full"
                    href="/chat"
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
                        className="feather feather-chevron-left transform scale-125"
                    >
                        <polyline points="15 18 9 12 15 6" />
                    </svg>{' '}
                </Link>

                <h1 className="text-3xl font-medium text-lime-800">Editor</h1>
            </header>
            <ul className="gallery my-4 gap-2 md:gap-4">
                <Link
                    href="/editor/new"
                    className="touch-callout-none hover:bg-amber-100 focus:bg-amber-100 transition-colors rounded-2xl"
                >
                    <li className="flex flex-col justify-center items-center gap-1 md:gap-2 mb-auto p-4">
                        <figure className="flex justify-center items-center size-24 object-center object-cover rounded-full mb-2 text-amber-600 bg-amber-100 overflow-hidden">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                className="transform scale-150"
                            >
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </figure>
                        <h2 className="text-amber-700 text-center text-xl md:text-2xl font-medium">
                            New
                        </h2>
                        <p className="text-amber-600 text-sm overflow-hidden line-clamp-2 text-ellipsis text-center">
                            Create new character
                        </p>
                    </li>
                </Link>
                {characters?.map(
                    ({ id, name, greeting, introduction, image }) => (
                        <Link
                            href={`/editor/${id}`}
                            key={id}
                            className="touch-callout-none hover:bg-lime-100 focus:bg-lime-100 transition-colors rounded-2xl"
                        >
                            <li className="flex flex-col justify-center items-center gap-1 md:gap-2 mb-auto p-4">
                                <figure className="size-24 object-center object-cover rounded-full mb-2 bg-lime-100 overflow-hidden">
                                    <img
                                        className="size-24 object-center object-cover"
                                        src={image ?? ''}
                                        alt={name}
                                    />
                                </figure>
                                <h2 className="text-lime-700 text-center text-xl md:text-2xl font-medium">
                                    {name}
                                </h2>
                                <p className="text-lime-600 text-sm overflow-hidden line-clamp-2 text-ellipsis text-center">
                                    {introduction ?? greeting}
                                </p>
                            </li>
                        </Link>
                    )
                )}
            </ul>
        </main>
    )
}
