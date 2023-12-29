// import { Ai } from '@cloudflare/ai'
import { env } from '../env'
import { Instruction, instruct } from './instruction'
import { CharacterAI, Prompt } from './types'

const models = {
    llama: '@cf/meta/llama-2-7b-chat-fp16'
} as const

export type ChatResponse =
    | {
          success: true
          result: {
              response: string
          }
          errors: unknown[]
          messages: unknown[]
      }
    | {
          success: false
          result: unknown
          errors: unknown[]
          messages: unknown[]
      }

export class CloudflareAI implements CharacterAI {
    // ai = new Ai({ token: env.CF_AI })

    constructor(public model = models.llama) {}

    async chat({
        content,
        ...instruction
    }: Omit<Instruction<'GPT'>, 'model'> & {
        content: string
    }) {
        const messages = instruct({
            ...instruction,
            chats: instruction.chats.concat({
                role: 'user',
                content
            }),
            model: 'GPT'
        })

        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/ai/run/${this.model}`,
            {
                headers: { Authorization: `Bearer ${env.CF_AI}` },
                method: 'POST',
                body: JSON.stringify({ messages })
            }
        ).then((res) => res.json())

        if (!response.success) throw response.errors[0]

        return response.result.response
    }
}
