import { Decoder, Encoder } from 'socket.io-parser'

class UnlimitedAttachmentsDecoder extends Decoder {
    constructor () {
        super({ maxAttachments: Infinity })
    }
}

const socketParser = { Encoder, Decoder: UnlimitedAttachmentsDecoder }

export { socketParser }
