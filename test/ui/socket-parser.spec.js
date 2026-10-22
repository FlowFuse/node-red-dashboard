const should = require('should') // eslint-disable-line no-unused-vars
const { Encoder, Decoder, PacketType } = require('socket.io-parser')

const { socketParser } = require('../../ui/src/util/socket-parser.js')

function encodeWithBuffers (count) {
    const buffers = Array.from({ length: count }, (_, i) => Buffer.from([i]))
    const packet = { type: PacketType.EVENT, nsp: '/', data: ['widget-load:chart', buffers] }
    return { buffers, parts: new Encoder().encode(packet) }
}

function decode (decoder, parts) {
    let decoded = null
    decoder.on('decoded', (packet) => { decoded = packet })
    parts.forEach((part) => decoder.add(part))
    return decoded
}

describe('socketParser', function () {
    it('decodes a packet with more than 10 binary attachments', function () {
        const { buffers, parts } = encodeWithBuffers(25)
        const decoded = decode(new socketParser.Decoder(), parts)
        decoded.data[0].should.equal('widget-load:chart')
        decoded.data[1].should.have.length(25)
        decoded.data[1].forEach((b, i) => Buffer.from(b).equals(buffers[i]).should.be.true())
    })

    it('replaces a default decoder that rejects the same packet', function () {
        const { parts } = encodeWithBuffers(25)
        ;(() => decode(new Decoder(), parts)).should.throw(/too many attachments/)
    })
})
