'use client'

import { useContext, useRef, Component, type PropsWithChildren } from 'react'
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'

class ErrorBoundary extends Component<PropsWithChildren> {
    constructor(props: {}) {
        super(props)
    }

    static getDerivedStateFromError() {}

    componentDidCatch() {}

    render() {
        return this.props.children
    }
}

export function FrozenRouter(props: PropsWithChildren) {
    const context = useContext(LayoutRouterContext)
    const frozen = useRef(context).current

    return (
        <LayoutRouterContext.Provider value={frozen}>
            {props.children}
        </LayoutRouterContext.Provider>
    )
}
