import { migrate } from 'drizzle-orm/libsql/migrator'

import { database } from './index'

migrate(database, { migrationsFolder: 'drizzle/migrations' })
