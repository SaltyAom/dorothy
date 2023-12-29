'use client'

import { useEffect, type PropsWithChildren } from 'react'
import { useRouter } from 'next/navigation'

import { useUser } from '@stores/user'

export default function Layout({ children }: PropsWithChildren) {
    const { user } = useUser()
    const router = useRouter()

    useEffect(() => {
        if(user === null)
            router.replace('/signin')
    }, [user])

    return children
}
