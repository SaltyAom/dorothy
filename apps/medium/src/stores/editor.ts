'use client'

import { useEffect } from 'react'
import { atom, useAtom } from 'jotai'

import { useIsMutating, useMutation, useQuery } from '@tanstack/react-query'
import { resonator } from '@services'
import { queryClient } from '@app/providers'

import { useUser } from './user'

export const useEditorList = () => {
    const { user } = useUser()

    const {
        data: characters,
        isError,
        isFetching: isEditorLoading,
        refetch
    } = useQuery({
        enabled: !!user,
        queryKey: ['editor', 'character', 'list'],
        retry: 2,
        staleTime: Infinity,
        queryFn: async () => {
            const { data, error } = await resonator.editor.character.get()

            if (error) throw error.value

            return data
        }
    })

    return {
        characters,
        isEditorLoading
    }
}
