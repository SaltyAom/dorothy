'use client'

import { useContext, useRef, PropsWithChildren } from 'react'
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'

export function FrozenRouter(props: PropsWithChildren<{}>) {
    const context = useContext(LayoutRouterContext)
    const frozen = useRef(context).current

    return (
        <LayoutRouterContext.Provider value={frozen}>
            {props.children}
        </LayoutRouterContext.Provider>
    )
}
