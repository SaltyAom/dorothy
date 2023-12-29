import { DreamRepository } from './base'

import { and, desc, eq } from 'drizzle-orm/sql'
import type { InferInsertModel } from 'drizzle-orm/table'

import { Table, Storage } from '@resonator/libs'

interface MutateCharacter
    extends Omit<InferInsertModel<typeof Table.character>, 'image'> {
    image?: File | null | undefined
}

class CharacterAdmin extends DreamRepository {
    async create({ image, ...data }: MutateCharacter) {
        return this.db
            .insert(Table.character)
            .values({
                ...data,
                image: await Storage.upload(image, {
                    name: data.name,
                    prefix: 'character/'
                })
            })
            .returning()
            .execute()
            .then(this.toOne)
    }

    async update(
        id: string,
        { image, ...data }: Partial<Omit<MutateCharacter, 'id'>>
    ) {
        return this.db
            .update(Table.character)
            .set({
                ...data,
                image: await Storage.upload(image, {
                    name: data?.name ?? image?.name ?? Date.now().toString(),
                    prefix: 'character/'
                })
            })
            .where(eq(Table.character.id, id))
            .returning()
            .execute()
            .then(this.toOne)
    }
}

export class DreamAdmin extends DreamRepository {
    character = new CharacterAdmin(this.db, this.config)
}
