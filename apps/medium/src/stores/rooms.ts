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

    const { isFetching: isRoomLoading } = useQuery({
        enabled: active && !end,
        queryKey: ['room', 'page', page],
        queryFn: async () => {
            const { data: response, error } =
                await resonator.character.room[page].get()

            if (error) throw error.value

            if (response.length) {
                setRooms((data) => ({
                    ...data,
                    rooms: [...data.rooms, ...response],
                    active: false
                }))
            } else {
                setRooms((data) => ({
                    ...data,
                    active: false
                }))
            }

            return response
        }
    })

    return {
        rooms,
        isRoomLoading
    }
}
