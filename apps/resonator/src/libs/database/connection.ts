import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'

import { Table } from './table'
import { env } from '../env'

export const client = createClient({
    url: env.SQLITE_URL,
    authToken: env.SQLITE_AUTH_TOKEN
})

export const database = drizzle(client, {
    schema: Table
})
