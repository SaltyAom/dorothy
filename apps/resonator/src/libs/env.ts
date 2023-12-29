import { t } from 'elysia'
import { TypeCompiler } from '@sinclair/typebox/compiler'

const structure = t.Object({
    GEMINI: t.String(),
    SQLITE_URL: t.String(),
    SQLITE_AUTH_TOKEN: t.String(),
    BUCKET: t.String(),
    R2_PUBLIC: t.String(),
    R2_API: t.String(),
    CF_AI: t.String(),
    CF_ACCOUNT_ID: t.String(),
    CF_ACCESS_KEY: t.String(),
    CF_SECRET_KEY: t.String(),
})

const compiler = TypeCompiler.Compile(structure)

if (!compiler.Check(process.env))
    throw new Error('Invalid environment variables')

export const env = compiler.Decode(process.env)
