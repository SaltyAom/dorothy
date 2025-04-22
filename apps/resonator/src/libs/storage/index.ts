import { Elysia } from 'elysia'

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { env } from '../env'
import { record } from '../tracing'

const s3Client = new S3Client({
    region: 'auto',
    endpoint: env.R2_API,
    credentials: {
        accessKeyId: env.CF_ACCESS_KEY,
        secretAccessKey: env.CF_SECRET_KEY
    }
})

export abstract class Storage {
	@record()
    static async upload(
        file?: Blob | File | null,
        {
            name,
            prefix = '',
            retry = 1,
            timeout = 6
        }: {
            name?: string
            prefix?: string
            retry?: number
            timeout?: number
        } = {}
    ) {
        if (!file) return

        if (prefix.startsWith('/')) prefix = prefix.substring(1)

        // @ts-ignore
        const Key = prefix + (name ?? file?.name)

        const Body = new Uint8Array(await file.arrayBuffer())

        const upload = async (iteration = 0): Promise<void> => {
            try {
                setTimeout(() => {
                    throw new Error('Upload timeout')
                }, timeout * 1000)

                await s3Client.send(
                    new PutObjectCommand({
                        Key,
                        Bucket: env.BUCKET,
                        Body
                    })
                )
            } catch (error) {
                if (iteration >= retry) throw error

                return upload(iteration + 1)
            }
        }

        await upload()

        return `${env.R2_PUBLIC}/${Key}`
    }

    @record()
    static async uploadMultiple(
        files?: (string | Blob | File | null)[],
        {
            name,
            prefix = ''
        }: {
            name?: string
            prefix?: string
        } = {}
    ) {
        if (!files) return

        files = Array.isArray(files) ? files : [files]
        const endpoint: string[] = []

        for (const file of files) {
            if (!file) continue

            if (typeof file === 'string') {
                endpoint.push(file)
                continue
            }

            // @ts-ignore
            const Key = prefix + (name ?? file.name ?? `${Date.now()}.jpg`)

            try {
                await s3Client.send(
                    new PutObjectCommand({
                        Key,
                        Bucket: env.BUCKET,
                        Body: new Uint8Array(await file.arrayBuffer())
                    })
                )
            } catch {
                throw new Error(
                    'S3 Error: Invalid permission. Please contact developer for correct credential setting'
                )
            }

            endpoint.push(`${env.R2_PUBLIC}/${Key}`)
        }

        return endpoint
    }
}
