'use client'

import { isServer } from '@services/flags'
import { useState, useEffect } from 'react'

const useScreenSize = (size = 0) => {
    const [screenSize, setScreenSize] = useState({
        width: isServer ? size : window.innerWidth,
        height: isServer ? size : window.innerHeight
    })

    useEffect(() => {
        const handleResize = () => {
            setScreenSize({
                width: window.innerWidth,
                height: window.innerHeight
            })
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return screenSize
}

export default useScreenSize
