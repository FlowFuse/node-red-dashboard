const path = require('path')
const { pathToFileURL } = require('url')

const should = require('should') // eslint-disable-line no-unused-vars

describe('vue-editor <script> support (ui-template code editor)', function () {
    let script
    before(async function () {
        script = await import(pathToFileURL(path.join(__dirname, '../../resources/vue-editor/vue-script.mjs')).href)
    })

    // what Node-RED's registerEmbeddedLanguages does with the insertions (see monaco-embedded.js)
    function applyInsertions (text, insertions) {
        let out = text
        for (const ins of insertions.slice().sort((a, b) => b.at - a.at)) {
            out = out.slice(0, ins.at) + ins.text + out.slice(ins.at)
        }
        return out
    }
    const scriptRegion = (text) => {
        const start = text.indexOf('<script>') + '<script>'.length
        return { start, end: text.indexOf('</script>') }
    }

    describe('findComponent', function () {
        it('finds the object of a single export default, like Dashboard does', function () {
            const body = '\n// a comment\nexport default {\n    data () { return {} }\n}\n'
            const c = script.findComponent(body)
            body[c.open].should.equal('{')
            body[c.close].should.equal('}')
            body.slice(c.close + 1).should.equal('\n')
            should(script.findComponent('/* x */ export default {};')).not.be.null()
        })
        it('treats anything else as raw JavaScript', function () {
            should(script.findComponent('const a = 1\nexport default {}')).be.null()
            should(script.findComponent('this.send({ payload: 1 })')).be.null()
            should(script.findComponent('export default { }\nconsole.log(1)')).be.null()
        })
    })

    describe('wrapScript', function () {
        it('wraps a component in __uiTemplate( ... )', function () {
            const text = '<template><div/></template>\n<script>\nexport default {\n    data () { return { a: 1 } }\n}\n</script>'
            const wrapped = applyInsertions(text, script.wrapScript(text, scriptRegion(text), 0))
            wrapped.should.containEql('export default __uiTemplate({\n    data () { return { a: 1 } }\n})\n</script>')
        })
        it('wraps raw JavaScript in a function whose this is the component', function () {
            const text = '<div id="x"></div>\n<script>\nthis.send({ payload: 1 })\n</script>'
            const wrapped = applyInsertions(text, script.wrapScript(text, scriptRegion(text), 2))
            wrapped.should.containEql('<script>/** @this {UiTemplateContext} */ function __uiTemplateScript2 () {\nthis.send({ payload: 1 })\n\n}</script>')
        })
        it('only inserts inside the script region', function () {
            const text = '<script>\nexport default {}\n</script>'
            const region = scriptRegion(text)
            for (const ins of script.wrapScript(text, region, 0)) {
                ins.at.should.be.within(region.start, region.end)
            }
        })
    })

    describe('UI_TEMPLATE_TYPES', function () {
        it('describes what Dashboard adds to the component', function () {
            for (const member of ['send(msg: any)', 'submit(event: Event)', 'readonly msg:', 'readonly id:', 'readonly props:', 'value: any', 'readonly $socket:', 'readonly $store:', 'readonly $router:', 'readonly $vuetify:']) {
                script.UI_TEMPLATE_TYPES.should.containEql(member)
            }
            script.UI_TEMPLATE_TYPES.should.containEql('declare function __uiTemplate<D = {}, C = {}, M = {}>(')
        })
    })

    describe('activate', function () {
        afterEach(function () { delete global.RED })

        it('registers the wrapper, types and CSS with Node-RED', function () {
            const calls = []
            global.RED = { editor: { codeEditor: { monaco: { registerEmbeddedLanguages: (id, options) => calls.push({ id, options }) } } } }
            script.activate({}, { languageId: 'vue-sfc' }).should.be.true()
            calls.should.have.length(1)
            calls[0].id.should.equal('vue-sfc')
            const { javascript, css } = calls[0].options
            javascript.wrap.should.equal(script.wrapScript)
            javascript.extraLibs[0].content.should.equal(script.UI_TEMPLATE_TYPES)
            javascript.hiddenNames.test('__uiTemplateScript0').should.be.true()
            javascript.demotedNames.test('$socket').should.be.true()
            css.should.eql({})
        })
        it('does nothing on Node-RED versions without registerEmbeddedLanguages', function () {
            global.RED = { editor: { codeEditor: { monaco: {} } } }
            script.activate({}, { languageId: 'vue-sfc' }).should.be.false()
        })
    })
})
