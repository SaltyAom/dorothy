import {
    GoogleGenerativeAI,
    HarmBlockThreshold,
    HarmCategory
} from '@google/generative-ai'

import { instruct, gptToGemini, Instruction } from './instruction'
import { env } from '../env'

import { CharacterAI, Prompt } from './types'

const genAI = new GoogleGenerativeAI(env.GEMINI)
const safety = [
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE
    },
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE
    },
    {
        category: HarmCategory.HARM_CATEGORY_UNSPECIFIED,
        threshold: HarmBlockThreshold.BLOCK_NONE
    }
]

const model = genAI.getGenerativeModel({
    model: 'gemini-pro',
    // safetySettings: safety
})

export class Gemini implements CharacterAI {
    async chat({
        content,
        ...instruction
    }: Omit<Instruction<'gemini'>, 'model'> & {
        content: string
    }) {
        const history = instruct({
            ...instruction,
            model: 'gemini'
        })

        const chat = await model.startChat({
            history,
            // safetySettings: safety
        })

        const { response } = await chat.sendMessage(content)
        const sentence = response.text()

        return sentence
    }
}
