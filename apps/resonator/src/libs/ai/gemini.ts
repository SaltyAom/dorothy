import {
    GoogleGenerativeAI,
    HarmBlockThreshold,
    HarmCategory
} from '@google/generative-ai'

import { instruct } from './instruction'
import { env } from '../env'
import { record } from '../tracing'

import { CharacterAI, Message, VisionMessage } from './types'

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
    model: 'gemini-2.5-flash-preview-04-17',
    safetySettings: safety
})

export class Gemini extends CharacterAI {
    constructor() {
        super()
    }

    @record()
    async chat({ content, images, ...instruction }: Message) {
        const history = this.record('instruct', () =>
            instruct({
                ...instruction,
                model: 'gemini'
            })
        )

        if (images?.length)
            content =
                content +
                '\nImages description: ' +
                (await this.vision({ images, content }))

        const chat = model.startChat({
            history
            // safetySettings: safety
        })

        const { response } = await this.record('generateResponse', () =>
            chat.sendMessage(content)
        )
        const sentence = response.text()

        return sentence
    }

    @record()
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

        const result = await model.generateContent([content, ...buffers])

        return result.response.text()
    }
}
