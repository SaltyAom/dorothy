import { useEffect } from 'react'
import { atom, useAtom } from 'jotai'

import { useIsMutating, useMutation, useQuery } from '@tanstack/react-query'
import { resonator } from '@services'

type Room = NonNullable<
    Awaited<ReturnType<resonator['character']['room'][':page']['get']>>['data']
>[0]

const roomAtom = atom<{
    active: boolean
    page: 1
    rooms: Room[]
    end: boolean
}>({
    active: true,
    page: 1,
    rooms: [],
    end: false
})
export const useRooms = () => {
    const [{ active, rooms, page, end }, setRooms] = useAtom(roomAtom)

    const { data: roomNetwork, isFetching, isPending } = useQuery({
        enabled: active && !end,
        queryKey: ['room', 'page', page],
        staleTime: Infinity,
        queryFn: async () => {
            const { data: response, error } =
                await resonator.character.room[page].get()

            if (error) throw error.value

            return response
        }
    })

    useEffect(() => {
        if (!roomNetwork || end) return

        const isEnd = roomNetwork.length < 25

        if (roomNetwork.length) {
            setRooms((data) => {
                const rooms: Room[] = [...data.rooms]

                for (const room of roomNetwork) {
                    if (
                        !rooms.find(
                            ({ character: { id } }) => room.character.id === id
                        )
                    )
                        rooms.push(room)
                }

                return {
                    ...data,
                    rooms,
                    active: false,
                    isEnd: end
                }
            })
        } else {
            setRooms((data) => ({
                ...data,
                active: false,
                isEnd: end
            }))
        }
    }, [roomNetwork])

    return {
        rooms,
        isRoomLoading: isFetching || isPending
    }
}
