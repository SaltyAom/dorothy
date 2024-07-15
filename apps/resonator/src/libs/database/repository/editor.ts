import { DreamRepository } from './base'

import { and, desc, eq } from 'drizzle-orm/sql'
import type { InferInsertModel } from 'drizzle-orm/table'

import { Table, Storage, record } from '@resonator/libs'

interface MutateCharacter
    extends Omit<InferInsertModel<typeof Table.character>, 'image'> {
    image?: File | null | undefined
}

class CharacterEditor extends DreamRepository {
    @record()
    async create(id: string, { image, ...data }: MutateCharacter) {
        return this.db
            .insert(Table.character)
            .values({
                ...data,
                creatorId: id,
                image: await Storage.upload(image, {
                    name: data?.name,
                    prefix: 'character/'
                })
            })
            .returning()
            .execute()
            .then(this.toOne)
    }

    @record()
    async update(
        characterId: string,
        userId: string,
        { image, ...data }: Partial<Omit<MutateCharacter, 'id'>>
    ) {
        return this.db
            .update(Table.character)
            .set({
                ...data,
                image: await Storage.upload(image, {
                    name: data?.name,
                    prefix: 'character/'
                })
            })
            .where(
                and(
                    eq(Table.character.id, characterId),
                    eq(Table.character.creatorId, userId)
                )
            )
            .returning()
            .execute()
            .then(this.toOne)
    }

    @record()
    list(userId: string) {
        return this.db.query.character
            .findMany({
                where: eq(Table.character.creatorId, userId)
            })
            .execute()
    }
}

export class DreamEditor extends DreamRepository {
    character = new CharacterEditor(this.db, this.config)
}
