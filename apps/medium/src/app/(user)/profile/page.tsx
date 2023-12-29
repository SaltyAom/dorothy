'use client'

import { useRef } from 'react'
import Link from 'next/link'

import { useUser } from '@stores'

export default function Profile() {
    const {
        isUserLoading,
        user,
        isProfileUpdating,
        updateProfile,
        signOut,
        isSigningOut
    } = useUser()

    const fileUpload = useRef<HTMLInputElement | undefined>(undefined)

    if (isUserLoading)
        return (
            <main className="relative flex flex-col justify-center items-center w-full min-h-screen select-none drag-none">
                <h1 className="absolute text-7xl font-thin text-lime-400">
                    <span className="z-10 block transform -translate-x-2 translate-y-4">
                        <span className="inline-block text-amber-400">P</span>R
                    </span>
                    <span className="block text-lime-400 transform translate-x-2 -translate-y-4">
                        <span className="inline-block text-amber-400">T</span>S
                    </span>
                </h1>
            </main>
        )

    const { username, profile } = user ?? {}

    return (
        <main className="flex flex-col gap-3 max-w-sm mx-auto p-4 py-16 select-none drag-none">
            <input
                ref={fileUpload as any}
                type="file"
                className="hidden"
                name="hidden"
                onChange={() => {
                    const profile = fileUpload.current?.files?.[0]

                    if (!profile) return

                    updateProfile({
                        profile
                    })
                }}
            />
            <button
                className="relative size-24 bg-amber-100 rounded-full mx-auto overflow-hidden"
                onClick={() => {
                    fileUpload.current?.click()
                }}
            >
                {isProfileUpdating ? (
                    <div className="absolute top-0 z-10 flex justify-center items-center w-full h-full bg-black/40 transition-colors">
                        <div className="loading loading-spinner loading-lg text-amber-400" />
                    </div>
                ) : (
                    <div className="absolute top-0 z-10 flex justify-center items-center w-full h-full bg-black/40 transition-opacity opacity-0 hover:opacity-100 focus:opacity-100">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-amber-400 scale-150"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </div>
                )}
                {profile ? <img src={profile} alt={username} /> : null}
            </button>
            <h1 className="text-2xl text-amber-700 font-medium mx-auto py-2 mb-6">
                {username}
            </h1>

            <Link
                href="/chat"
                className="text-xl font-medium text-lime-800 p-4 hover:bg-lime-100 focus:bg-lime-100 text-center rounded-full transition-colors"
            >
                Chat
            </Link>

            <button
                className="relative gap-3 text-lg text-amber-800 font-medium mt-4 p-4 bg-amber-100 hover:bg-amber-200 focus:bg-amber-200 rounded-full transition-colors"
                onClick={() => {
                    signOut()
                }}
            >
                Sign Out
                {isSigningOut && (
                    <span className="absolute loading loading-spinner text-amber-700 ml-3" />
                )}
            </button>
        </main>
    )
}
