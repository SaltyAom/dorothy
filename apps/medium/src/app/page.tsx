import Link from 'next/link'
import type { Metadata } from 'next'

import { resonator } from '@services'

export const metadata: Metadata = {
    title: 'Hello',
    openGraph: {
        title: 'Next Starter',
        description: "SaltyAom's Next Starter",
        images: '/og',
        authors: 'SaltyAom'
    }
}

export default async function Index() {
    const { data, error } = await resonator.character.list({ page: 1 }).get({
        fetch: {
            next: { revalidate: 5 }
        }
    })

    console.log({ error })

    if (error)
        return (
            <h1 className="flex justify-center items-center w-full h-screen text-4xl text-lime-800">
                Medium
            </h1>
        )

    return (
        <main className="flex flex-col max-w-6xl w-full min-h-screen mx-auto p-4 md:py-8 select-none drag-none">
            <h1 className="text-3xl font-medium text-lime-800">Characters</h1>
            <ul className="gallery my-4 gap-2 md:gap-4">
                {data?.map(({ id, name, greeting, image }) => (
                    <Link
                        href={`/chat/${id}`}
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
                                {greeting}
                            </p>
                        </li>
                    </Link>
                ))}
            </ul>
        </main>
    )
}
