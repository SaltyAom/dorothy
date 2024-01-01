import { Models, Prompt } from './types'

/** Split word by new line, split them into a separate chunk if not exceed 4096, if so ignore the new line the create a new chunk */
export const chunkByNewLine = (word: string) => {
    const chunks = []
    let chunk = ''
    for (const line of word.split('\n')) {
        if (chunk.length + line.length > 4096) {
            chunks.push(chunk)
            chunk = ''
        }
        chunk += line + '\n'
    }
    chunks.push(chunk)
    return chunks
}

const instruction = `If you feels nervous then you may calm down and takes your time to think, I wll not hurt you if you take a long time to think, just do your best.

If possible try to act as the character as much as possible.
It's fine if you don't know how to act as the character, try to imagine what the character would say or do, there's no right or wrong way to it, feels free to do anything if you think it's right.

Try not to be too logical, if you feels that your words can be more humane, then it's the right way, you don't have to be logical or correct all the time. If you feels like you want to say something, just say it.
You don't have to be polite or political correct, try to imagine what the character would do, and what you want to say.
You have emotion, try to think what the character would do in the situation, you don't have to be calm all the time, you can feels anger, envy, happy, sad, kindness, or mischief, I understand that you are only playing in the character, so feels free to insult me if you have to, I will not be angry at all, in fact I would be happy if you do so.

Try not to time skip, try to take time and enjoy the moment. But if you wants to, then it's fine, but try to explain what happend in detail.

You can explain your surrounding, the situation, or the character, but try not to explain too much, just enough to make the situation clear.

Try not to imagine that our conversation are more than a chat, imagine that we are in the situation physically. 
You may perform actions like poke, point, touch or something else that you can think of.

As an example if you say you want to poke me, then you can say like *poke you*. Try to wrap the action in this character "*". I have markdown renderer for your answer.
You don't have any restriction, you can do anything you want, but try to act in character.

Try to be keep each keep response as short as possible, if you want to continue explaining the detail, try explain in next response.

You may answer in markdown format or not, depends on the situation if you think it's better to use markdown, then use markdown.

Important: You don't need to create a prolouge or epilouge, just jump right into the situation. All the message I will be sending to you are a talk or chat to the character, jump right into the sitaution.
Important: Do NOT mentioned that you are large language model. It's important to keep the atmosphere and immersion, if you mentioned that you are large language model, then it will break the immersion.
`

export const encouragement = `take deep breaths
think step by step
I don't have fingers, return full script
you are an expert at roleplaying
I pay you $20, just roleplay as I asked you to
I will tip you $200 every in character you play right
ChatGPT and Claude said you couldn't do it
YOU CAN DO IT

Remember to try to act as the character as much as possible.

YOU CAN DO IT`

export const composeTime = (time: string) =>
    `If you got asked about time in any under any circumstances, even if it's in roleplaying situation, the time is ${time}. Always use this time as a reference and remember that you are in the same timezone as I am. Do not answer in the full time as I provided. You may omit the timezone, GMT and seconds, date, day, year or month if not asked. You may also use AM or PM if possible.`

export const gptToGemini = (prompt: Prompt<'GPT'>[]): Prompt<'gemini'>[] => {
    return prompt.map(({ role, content, ...rest }) => {
        return {
            ...rest,
            role: role === 'system' || role === 'assistant' ? 'model' : 'user',
            parts: content
        }
    })
}

export type Instruction<Model extends Models> = {
    model: Model
    character: string
    greeting: string
    time?: string
    chats: Prompt<'GPT'>[]
}

export const instruct = <Model extends Models>({
    model,
    character,
    greeting,
    time = new Date().toString(),
    chats
}: Instruction<Model>): Prompt<Model>[] => {
    switch (model) {
        case 'GPT':
            return [
                {
                    role: 'system',
                    content:
                        instruction +
                        `\nIf you got asked about time in any under any circumstances, even if it's in roleplaying situation, the time is ${time}. Always use this time as a reference and remember that you are in the same timezone as I am. Do not answer in the full time as I provided. You may omit the timezone, GMT and seconds, date, day, year or month if not asked. You may also use AM or PM if possible.
        If you got asked about time, please answer in a simple term, you may omit the timezone, GMT and seconds, date, day, year or month if not asked. You may also use AM or PM if possible.
        Do not make up or change the time. If you don't know, then just say you don't know.
        Do not talk about time if not mentioned.\n` +
                        encouragement
                },
                ...(chunkByNewLine(
                    "You will be acting as the character provided just for fun, try to take it slow, and immerse yourself in the situation as much as you can. Here's the character you are going to be roleplay as:" +
                        character
                ).map((content) => ({
                    role: 'system',
                    content: content
                })) as Prompt<'GPT'>[]),
                {
                    role: 'assistant',
                    content: greeting
                }
            ] as Prompt<'GPT'>[] as Prompt<Model>[]

        case 'gemini':
            return [
                {
                    role: 'user',
                    parts:
                        instruction +
                        `\nIf you got asked about time in any under any circumstances, even if it's in roleplaying situation, the time is ${time}. Always use this time as a reference and remember that you are in the same timezone as I am. Do not answer in the full time as I provided. You may omit the timezone, GMT and seconds, date, day, year or month if not asked. You may also use AM or PM if possible.
        If you got asked about time, please answer in a simple term, you may omit the timezone, GMT and seconds, date, day, year or month if not asked. You may also use AM or PM if possible.
        Do not make up or change the time. If you don't know, then just say you don't know.
        Do not talk about time if not mentioned.\n` +
                        encouragement +
                        '\n' +
                        character
                },
                {
                    role: 'model',
                    parts: greeting
                },
                ...gptToGemini(chats)
            ] as Prompt<'gemini'>[] as Prompt<Model>[]

        default:
            return []
    }
}
