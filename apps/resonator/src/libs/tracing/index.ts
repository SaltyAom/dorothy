import { Elysia } from 'elysia'
import type { Span } from '@opentelemetry/api'
import { getTracer, opentelemetry } from '@elysiajs/opentelemetry'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node'

export const tracing = new Elysia({ name: 'tracing' }).use(
    opentelemetry({
        spanProcessors: [
            new BatchSpanProcessor(
                new OTLPTraceExporter(
                    process.env.NODE_ENV === 'production'
                        ? {
                              url: 'https://api.axiom.co/v1/traces',
                              headers: {
                                  Authorization: `Bearer ${Bun.env.AXIOM_KEY}`,
                                  'X-Axiom-Dataset': Bun.env.AXIOM_DATASET
                              }
                          }
                        : {}
                )
            )
        ]
    })
)

export function record(name?: string) {
    return function decorator(_instance: unknown, _method: unknown) {
        return _instance

        const instance = _instance as Record<string, unknown>
        const method = _method as string

        const namespace = instance.name ?? instance.constructor.name
        const rootFn = instance[method] as Function
        const operation = name ?? `${namespace}.${method}`

        instance[method] = function override(this: any, ...args: unknown[]) {
            const fn = rootFn.bind(this)

            return getTracer().startActiveSpan(operation, () => fn(...args))
        }

        return instance as any
    }
}

export const traceMethod = <F extends (span: Span) => unknown>(
    name: string,
    fn: F
): ReturnType<F> => {
    return getTracer().startActiveSpan(name, fn) as any
}
