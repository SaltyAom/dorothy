import { Gemini } from './gemini'
import { CloudflareAI } from './cloudflare'

export * from './cloudflare'
export * from './instruction'

export const AI = {
    gemini: new Gemini(),
    cloudflare: new CloudflareAI()
}
