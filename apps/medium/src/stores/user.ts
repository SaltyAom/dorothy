import { useEffect } from 'react'
import { atom, useAtom } from 'jotai'

import { useIsMutating, useMutation, useQuery } from '@tanstack/react-query'
import { resonator } from '@services'

type Profile = Awaited<ReturnType<resonator['auth']['profile']['get']>>['data']
type UpdateProfile = Partial<
    Omit<Profile, 'profile'> & {
        profile: File
    }
>

const userAtom = atom<Profile | null | undefined>(undefined)
export const useUser = () => {
    const [user, setUser] = useAtom(userAtom)

    const {
        data,
        isError,
        isFetching: isUserLoading,
        refetch
    } = useQuery({
        enabled: user === undefined,
        queryKey: ['user', 'profile'],
        retry: false,
        queryFn: async () => {
            const { data, error } = await resonator.auth.profile.get()

            if (error) throw error.value

            return data
        }
    })

    const isProfileUpdating =
        useIsMutating({
            mutationKey: ['user', 'profile', 'update']
        }) !== 0

    const { mutate: updateProfile } = useMutation({
        mutationKey: ['user', 'profile', 'update'],
        mutationFn: async (profile: UpdateProfile) => {
            const { data, error } = await resonator.auth.profile.patch(profile)

            if (error) throw error.value

            setUser(data)

            return data
        }
    })

    const isSigningOut =
        useIsMutating({
            mutationKey: ['user', 'profile', 'signOut']
        }) !== 0

    const { mutate: signOut } = useMutation({
        mutationKey: ['user', 'profile', 'signOut'],
        mutationFn: async () => {
            const { data, error } = await resonator.auth['sign-out'].get()

            if (error) throw error.value

            window.location.reload()
        }
    })

    useEffect(() => {
        if (isError) return setUser(null)

        setUser(data)
    }, [data, isError])

    return {
        user,
        updateProfile,
        isUserLoading,
        isProfileUpdating,
        refetch,
        signOut,
        isSigningOut
    }
}
