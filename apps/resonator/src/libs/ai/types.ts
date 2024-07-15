import { getTracer, type StartActiveSpan } from '@elysiajs/opentelemetry'
import type { Instruction } from './instruction'
import { traceMethod } from '../tracing'

export type Models = 'GPT' | 'gemini'

export type Prompt<Model extends Models = 'gemini'> = Model extends 'GPT'
    ? {
          role: 'user' | 'assistant' | 'system'
          content: string
      }
    : {
          role: 'model' | 'user'
          parts: {
              text: string
          }[]
      }

export type Message = Omit<Instruction<any>, 'model'> & {
    content: string
} & {
    images?: File[]
}

export type VisionMessage = {
    images: File[]
    content: string
}

export abstract class CharacterAI {
    constructor() {
        this.record = traceMethod
    }

    record: typeof traceMethod

    abstract chat(messages: Message): Promise<string>
    abstract vision(messages: VisionMessage): Promise<string>
}
