'use client'

import { useRouter } from 'next/navigation'

import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { resonator } from '@services'
import { z } from 'zod'
import { useEffect } from 'react'
import { useUser } from '@stores'

const form = z.object({
    username: z.string().min(5, 'Username must be at least 5 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters')
})

type form = z.infer<typeof form>

export default function SignInPage() {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<form>({
        resolver: zodResolver(form)
    })

    const { user, refetch } = useUser()
    const router = useRouter()

    const { mutate, isPending, error } = useMutation({
        mutationKey: ['signin'],
        mutationFn: async (value: form) => {
            const { data, error } = await resonator.auth['sign-in'].post(value)

            if (error) throw error?.value ?? error

            refetch()

            return data
        }
    })

    useEffect(() => {
        if (user?.id) {
            router.replace('/chat')
        }
    }, [user])

    return (
        <main className="flex flex-col justify-center items-center w-full min-h-screen">
            <form
                className="flex flex-col w-full gap-1 max-w-xs mx-auto pb-8"
                onSubmit={handleSubmit((data) => mutate(data))}
            >
                <h1 className="text-5xl text-lime-800 font-medium mb-6">
                    PRTS
                </h1>

                <label
                    className="text-sm text-lime-700 pl-4"
                    htmlFor="username"
                >
                    Username
                </label>
                <input
                    {...register('username')}
                    id="username"
                    type="text"
                    placeholder="Username"
                    className="text-lg text-lime-700 placeholder-lime-600 px-4 py-3 bg-lime-100 rounded-xl border-0"
                />
                {errors.username && (
                    <p className="text-red-500 text-xm font-medium mt-2">
                        {errors.username?.message ?? ''}
                    </p>
                )}

                <label
                    className="text-sm text-lime-700 mt-4 pl-4"
                    htmlFor="password"
                >
                    Password
                </label>
                <input
                    {...register('password')}
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Password"
                    className="text-lg text-lime-700 placeholder-lime-600 px-4 py-3 bg-lime-100 rounded-xl border-0"
                />
                {errors.password && (
                    <p className="text-red-500 text-xm font-medium mt-2">
                        {errors.password?.message ?? ''}
                    </p>
                )}

                {error ? (
                    <p className="text-red-500 text-xm font-medium mt-2">
                        {error?.message ?? error.toString()}
                    </p>
                ) : (
                    <p className="h-4" aria-hidden />
                )}
                <button
                    className="text-amber-700 text-lg font-medium bg-amber-100 hover:bg-amber-200 focus:bg-amber-200 mt-2 px-6 py-3 rounded-xl transition-colors"
                    disabled={isPending}
                >
                    Sign In
                    {isPending && (
                        <span className="loading loading-spinner ml-3 text-amber-700 absolute" />
                    )}
                </button>
            </form>
        </main>
    )
}
