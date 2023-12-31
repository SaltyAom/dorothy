const { join } = require('path')

// const withPwa = require('next-pwa')
const withAnalyze = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true'
})

const withPlugins = require('next-compose-plugins')
const pwaConfig = require('./tools/withPwa')

module.exports = withPlugins(
    [
        // [withPwa, pwaConfig]
        [withAnalyze]
    ],
    {
        eslint: {
            ignoreDuringBuilds: true
        },
        experimental: {
            outputFileTracingRoot: join(__dirname, '../../')
        },
        output: 'standalone',
        // swcMinify: true,
        typescript: {
            ignoreBuildErrors: true
        },
        webpack: (config) => {
            config.module.rules.push({
                test: /\.m?js$/,
                type: 'javascript/auto',
                resolve: {
                    fullySpecified: false
                }
            })

            return config
        },

        async rewrites() {
            return [
                {
                    source: '/service-worker.js',
                    destination: '/_next/static/service-worker.js'
                }
            ]
        },
        env: {
            NEXT_PUBLIC_RESONATOR:
                process.env.RESONATOR ?? process.env.NEXT_PUBLIC_RESONATOR
            // 'http://192.168.0.181:3001'
        },
        images: {
            deviceSizes: [640, 750, 828, 1080],
            imageSizes: [16, 32, 48, 64, 96],
            path: '/_next/image',
            loader: 'default'
        },
        webpack(config, options) {
            config.resolve.alias = {
                ...config.resolve.alias,
                '@app': join(__dirname, 'src/app'),
                '@layouts': join(__dirname, 'src/layouts'),
                '@components': join(__dirname, 'src/components'),
                '@shared': join(__dirname, 'src/components/shared'),
                '@modules': join(__dirname, 'src/components/modules'),
                '@styles': join(__dirname, 'src/styles'),
                '@services': join(__dirname, 'src/services'),
                '@models': join(__dirname, 'src/models'),
                '@stores': join(__dirname, 'src/stores'),
                '@design-system': join(
                    __dirname,
                    'src/components/design-system'
                ),
                '@design-system/utils': join(
                    __dirname,
                    'src/components/design-system/utils'
                ),
                '@public': join(__dirname, 'public'),
                '@': __dirname
            }

            return config
        },
        i18n: {
            locales: ['en-US'],
            defaultLocale: 'en-US'
        }
    }
)
