import {
    GoogleGenerativeAI,
    HarmBlockThreshold,
    HarmCategory
} from '@google/generative-ai'

import { instruct, gptToGemini, Instruction } from './instruction'
import { env } from '../env'

import { CharacterAI, Message, Prompt, VisionMessage } from './types'

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
    model: 'gemini-pro'
    // safetySettings: safety
})

const vision = genAI.getGenerativeModel({
    model: 'gemini-pro-vision'
})

export class Gemini implements CharacterAI {
    async chat({ content, images, ...instruction }: Message) {
        const history = instruct({
            ...instruction,
            model: 'gemini'
        })

        if (images?.length)
            content =
                content +
                '\nImages description: ' +
                (await this.vision({ images, content }))

        const chat = await model.startChat({
            history
            // safetySettings: safety
        })

        const { response } = await chat.sendMessage(content)
        const sentence = response.text()

        return sentence
    }

    async vision({ images, content }: VisionMessage) {
        const buffers = await Promise.all(
            images.map(async (image) => ({
                inlineData: {
                    data: Buffer.from(await image.arrayBuffer()).toString(
                        'base64'
                    ),
                    mimeType: image.type
                }
            }))
        )

        const result = await vision.generateContent([content, ...buffers])
        const response = await result.response
        const text = response.text()

        return text
    }
}
