const should = require('should') // eslint-disable-line no-unused-vars

const { expandSelfClosingTags } = require('../../ui/src/util/self-closing-tags.js')

describe('expandSelfClosingTags', function () {
    it('expands self-closed custom components', function () {
        expandSelfClosingTags('<v-btn color="red" />').should.equal('<v-btn color="red" ></v-btn>')
        expandSelfClosingTags('<v-btn/>').should.equal('<v-btn></v-btn>')
    })

    it('keeps v-if / v-else siblings adjacent', function () {
        const out = expandSelfClosingTags('<template><v-btn v-if="a" /><v-btn v-else /></template>')
        out.should.equal('<template><v-btn v-if="a" ></v-btn><v-btn v-else ></v-btn></template>')
    })

    it('leaves void elements alone', function () {
        const src = '<div><br/><img src="a.png" /><input type="text"></div>'
        expandSelfClosingTags(src).should.equal(src)
    })

    it('ignores "/>" inside quoted attribute values', function () {
        const src = '<v-btn label="a />b" @click="x = 1" />'
        expandSelfClosingTags(src).should.equal('<v-btn label="a />b" @click="x = 1" ></v-btn>')
        const src2 = '<div title=\'<b />\'>x</div>'
        expandSelfClosingTags(src2).should.equal(src2)
    })

    it('does not touch comments, scripts or styles', function () {
        const src = '<!-- <v-btn /> --><script>const a = "<x />"</script><style>a::after{content:"<y />"}</style>'
        expandSelfClosingTags(src).should.equal(src)
    })

    it('leaves strings without self-closing tags untouched', function () {
        const src = '<div>a < b && c > d</div>'
        expandSelfClosingTags(src).should.equal(src)
        expandSelfClosingTags('').should.equal('')
    })
})
