import { Elysia } from 'elysia'

import { characterAdmin } from './character'

export const admin = new Elysia({
    name: '@controller/admin'
}).use(characterAdmin)

export { characterAdmin}