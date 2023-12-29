import type { PropsWithChildren } from 'react'

import Provider from './providers'

import '@styles/global.sass'

export default function RootLayout({ children }: PropsWithChildren) {
    return (
        <html lang="en">
            <head>
                <title>PRTS</title>
                <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📘</text></svg>" />

                <link rel="manifest" href="assets/app/manifest.json" />
                <meta name="mobile-web-app-capable" content="yes" />

                <meta name="theme-color" content="#fbfff4" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <link
                    rel="apple-touch-icon"
                    href="Image which appear on iOS device"
                />
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="default"
                />
                <meta name="format-detection" content="telephone=no" />
                <meta name="apple-touch-fullscreen" content="yes" />
            </head>
            <body>
                <Provider>{children}</Provider>
            </body>
        </html>
    )
}
