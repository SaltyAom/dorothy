import { Elysia } from 'elysia'

import { characterEditor } from './character'

export const admin = new Elysia({
    name: '@controller/editor'
}).use(characterEditor)

export { characterEditor }
