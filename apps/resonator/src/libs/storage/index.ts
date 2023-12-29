import { Elysia } from 'elysia'

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { env } from '../env'

const s3Client = new S3Client({
    region: 'auto',
    endpoint: env.R2_API,
    credentials: {
        accessKeyId: `${env.CF_ACCESS_KEY}`,
        secretAccessKey: `${env.CF_SECRET_KEY}`
    }
})

export abstract class Storage {
    static async upload(
        file?: Blob | File | null,
        {
            name,
            prefix = ''
        }: {
            name?: string
            prefix?: string
        } = {}
    ) {
        if (!file) return

        const Key = prefix + (name ?? file.name ?? `${Date.now()}.jpg`)

        await s3Client.send(
            new PutObjectCommand({
                Key,
                Bucket: env.BUCKET,
                Body: new Uint8Array(await file.arrayBuffer())
            })
        )

        return `${env.R2_PUBLIC}/${Key}`
    }

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
