if (!global.TextDecoderStream) {
    const tds = {
        start() {
            // @ts-ignore
            this.decoder = new TextDecoder(this.encoding, this.options)
        },
        // @ts-ignore
        transform(chunk, controller) {
            // @ts-ignore
            controller.enqueue(this.decoder.decode(chunk, { stream: true }))
        }
    }

    let _jstds_wm = new WeakMap() /* info holder */
    class TextDecoderStream extends TransformStream {
        constructor(encoding = 'utf-8', { ...options } = {}) {
            let t = { ...tds, encoding, options }

            super(t)
            _jstds_wm.set(this, t)
        }
        get encoding() {
            return _jstds_wm.get(this).decoder.encoding
        }
        get fatal() {
            return _jstds_wm.get(this).decoder.fatal
        }
        get ignoreBOM() {
            return _jstds_wm.get(this).decoder.ignoreBOM
        }
    }

    global.TextDecoderStream = TextDecoderStream
}

export {}
