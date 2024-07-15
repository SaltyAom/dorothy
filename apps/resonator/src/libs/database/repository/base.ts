import { traceMethod } from '../../tracing'
import { database } from '../connection'

export abstract class DreamRepository {
    constructor(
        public db = database,
        public config: {
            batchSize: number
        } = { batchSize: 25 }
    ) {
    	this.record = traceMethod.bind(this)
    }

    record: typeof traceMethod

    protected batch(batch: number) {
        return (batch - 1) * this.config.batchSize
    }

    protected toOne<T extends any[]>([one]: T): T[0] {
        if (!one) throw new Error('Failed to update')

        return one
    }
}
