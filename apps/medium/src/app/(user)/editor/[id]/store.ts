'use client'

import { useIsMutating, useMutation, useQuery } from '@tanstack/react-query'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { resonator } from '@services'
import { queryClient } from '@app/providers'
import { useEffect } from 'react'

const form = z.object({
    name: z.string().min(1, 'Name is required'),
    image: z.instanceof(File).optional(),
    greeting: z.string().min(1, 'Greeting is required'),
    introduction: z.string().min(1, 'Introduction is required'),
    instruction: z.string().min(1, 'Instruction is required')
})

type form = z.infer<typeof form>

export const useCharacterEditor = (id: string) => {
    const {
        data: character,
        error,
        isPending: isCharacterPending,
        isFetching: isCharacterFetching
    } = useQuery({
        queryKey: ['editor', 'character', 'get', id ?? 'new'],
        staleTime: Infinity,
        async queryFn() {
            if (!id) return

            const { data, error } = await resonator.editor
                .character({ id })
                .get()

            if (error) throw error

            return data
        },
        enabled: !!id
    })

    const {
        register,
        handleSubmit,
        formState: { errors: formError },
        setValue
    } = useForm<form>({
        resolver: zodResolver(form)
    })

    console.log(formError)

    useEffect(() => {
        if (character?.name) setValue('name', character.name)
        if (character?.greeting) setValue('greeting', character.greeting)
        if (character?.introduction)
            setValue('introduction', character.introduction)
        if (character?.instruction)
            setValue('instruction', character.instruction)
    }, [character])

    const isEditing =
        useIsMutating({
            mutationKey: ['editor', 'character', 'edit', id]
        }) !== 0
    const { mutate: edit } = useMutation({
        mutationKey: ['editor', 'character', 'edit', id],
        async mutationFn(input: form) {
            if (!id) return

            const { data, error } = await resonator.editor
                .character({ id })
                .patch(input)

            queryClient.invalidateQueries({
                queryKey: ['editor', 'character', 'get', id]
            })

            if (error) throw error

            return data
        }
    })

    const isCreating =
        useIsMutating({
            mutationKey: ['editor', 'character', 'create']
        }) !== 0
    const { data: recentCharacter, mutate: create } = useMutation({
        mutationKey: ['editor', 'character', 'create'],
        async mutationFn(input: form) {
            const { data, error } = await resonator.editor.character.put(input)

            if (error) throw error

            await Promise.all([
                queryClient.invalidateQueries({
                    refetchType: 'active',
                    queryKey: ['editor', 'character', 'list']
                }),
                queryClient.prefetchQuery({
                    queryKey: ['editor', 'character', 'get', data.id]
                })
            ])

            return data
        }
    })

    return {
        character,
        error,
        isCharacterLoading: isCharacterFetching || isCharacterFetching,
        register,
        edit,
        create,
        recentCharacter,
        isEditing,
        isCreating,
        handleSubmit,
        formError,
        setValue
    } as const
}
