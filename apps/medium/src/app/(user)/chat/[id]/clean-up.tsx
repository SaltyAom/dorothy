'use client'

import { useEffect, useLayoutEffect } from 'react'
import { useParams } from 'next/navigation'

import { useHydrateAtoms } from 'jotai/utils'

import { Composer, Chat, Conversation } from '@modules/chat'
import {
    characterIdAtom,
    useCharacterId,
    useChat
} from '@components/modules/chat/store'

export default function CleanUp({
    characterId = null
}: {
    characterId?: string | null
}) {
    const { id } = useParams()
    const [char, setCharacterId] = useCharacterId()
    const { dispatch } = useChat()

    useHydrateAtoms([[characterIdAtom, characterId]])

    useEffect(() => {
        setCharacterId(Array.isArray(id) ? id[0] : id)

        return () => {
            setCharacterId(null)
            dispatch({ type: 'set', payload: [] })
        }
    }, [id])

    useLayoutEffect(() => {
        setTimeout(() => {
            window.scrollTo({
                top:
                    document.getElementsByClassName('page')[0]?.clientHeight ??
                    document.body.clientHeight,
                behavior: 'smooth'
            })
        }, 400)
    }, [])

    return null
}
