import type { Instruction } from './instruction'

export type Models = 'GPT' | 'gemini'

export type Prompt<Model extends Models = 'gemini'> = Model extends 'GPT'
    ? {
          role: 'user' | 'assistant' | 'system'
          content: string
      }
    : {
          role: 'model' | 'user'
          parts: string
      }

export abstract class CharacterAI {
    abstract chat(messages: Omit<Instruction<any>, 'model'> & {
        content: string
    }): Promise<string>
}
