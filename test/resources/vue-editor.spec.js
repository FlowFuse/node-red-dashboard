const path = require('path')
const { pathToFileURL } = require('url')

const should = require('should')

// minimal stand-in for the parts of the monaco namespace that getCompletions uses
const monaco = {
    languages: {
        CompletionItemKind: { Class: 'Class', Module: 'Module', Property: 'Property', Event: 'Event', Field: 'Field', Keyword: 'Keyword', EnumMember: 'EnumMember' },
        CompletionItemInsertTextRule: { InsertAsSnippet: 4 }
    }
}

// a small slice of the generated vuetify.json
const data = {
    vuetify: '3.11.3',
    strings: ['Applies a distinct style to the component.', 'Applies specified color to the control.', 'Event that is emitted when the component\'s model changes.', 'The element used to activate the component.', 'The default Vue slot.'],
    tags: {
        'v-btn': { p: [['variant', '\'flat\' | \'text\' | \'outlined\'', 0, '\'elevated\''], ['color', 'string', 1, ''], ['block', 'boolean', -1, 'false']], e: [], s: [['default', 4]] },
        'v-menu': { p: [['model-value', 'boolean', -1, 'false']], e: [['update:model-value', 'boolean', 2]], s: [['activator', 3], ['default', 4]] }
    },
    directives: [['v-ripple', 'boolean | { class: string }', -1, ['center', 'circle']]]
}

describe('vue-editor (ui-template code editor support)', function () {
    let vue
    before(async function () {
        vue = await import(pathToFileURL(path.join(__dirname, '../../resources/vue-editor/vue-sfc.mjs')).href)
    })

    describe('kebab', function () {
        it('converts component, prop and event names', function () {
            vue.kebab('VBtn').should.equal('v-btn')
            vue.kebab('VCardActions').should.equal('v-card-actions')
            vue.kebab('VScrollXReverseTransition').should.equal('v-scroll-x-reverse-transition')
            vue.kebab('itemsPerPage').should.equal('items-per-page')
            vue.kebab('v-btn').should.equal('v-btn')
        })
    })

    describe('splitAttributeName', function () {
        it('recognises the Vue prefixes', function () {
            vue.splitAttributeName(':items').should.eql({ prefix: ':', name: 'items', kind: 'prop' })
            vue.splitAttributeName('v-bind:items').should.eql({ prefix: 'v-bind:', name: 'items', kind: 'prop' })
            vue.splitAttributeName('@click.stop').should.eql({ prefix: '@', name: 'click', kind: 'event' })
            vue.splitAttributeName('v-on:click').should.eql({ prefix: 'v-on:', name: 'click', kind: 'event' })
            vue.splitAttributeName('#activator').should.eql({ prefix: '#', name: 'activator', kind: 'slot' })
            vue.splitAttributeName('color').should.eql({ prefix: '', name: 'color', kind: 'attribute' })
        })
    })

    describe('literalValues', function () {
        it('extracts string literals from a union type', function () {
            vue.literalValues('\'start\' | \'end\' | boolean').should.eql(['start', 'end'])
            vue.literalValues('string').should.eql([])
            vue.literalValues(undefined).should.eql([])
        })
    })

    describe('getCursorContext', function () {
        it('detects a tag name', function () {
            vue.getCursorContext('<template>\n  <v-bt').should.eql({ kind: 'tagName', prefix: 'v-bt', offset: 14 })
        })
        it('detects an attribute name, with its prefix', function () {
            const ctx = vue.getCursorContext('<v-btn color="primary" :var')
            ctx.should.have.properties({ kind: 'attributeName', tag: 'v-btn', prefix: ':var', offset: 23 })
        })
        it('detects a new attribute after a space', function () {
            vue.getCursorContext('<v-btn block ').should.have.properties({ kind: 'attributeName', tag: 'v-btn', prefix: '' })
        })
        it('detects an attribute value', function () {
            vue.getCursorContext('<v-btn variant="out').should.have.properties({ kind: 'attributeValue', tag: 'v-btn', attribute: 'variant', prefix: 'out' })
        })
        it('skips over quoted values that contain > or quotes', function () {
            vue.getCursorContext('<v-btn @click="a > b ? \'x\' : \'y\'" ').should.have.properties({ kind: 'attributeName', tag: 'v-btn' })
        })
        it('returns null in text content, interpolations, comments and script/style blocks', function () {
            should(vue.getCursorContext('<v-btn>Sen')).be.null()
            should(vue.getCursorContext('<p>{{ msg.pay')).be.null()
            should(vue.getCursorContext('<!-- <v-bt')).be.null()
            should(vue.getCursorContext('<script>\nconst a = 1 <')).be.null()
            should(vue.getCursorContext('<style>\n.a { color: re')).be.null()
            should(vue.getCursorContext('</v-btn')).be.null()
        })
        it('works again after a script block is closed', function () {
            vue.getCursorContext('<script>let a</script>\n<v-bt').should.have.properties({ kind: 'tagName', prefix: 'v-bt' })
        })
    })

    describe('getParentTag', function () {
        it('finds the enclosing element', function () {
            should(vue.getParentTag('<v-card>\n<v-menu>\n')).equal('v-menu')
            should(vue.getParentTag('<v-card>\n<v-menu></v-menu>\n')).equal('v-card')
            should(vue.getParentTag('<v-card><img src="x"><br/><v-btn block />')).equal('v-card')
            should(vue.getParentTag('')).be.null()
        })
    })

    describe('getCompletions', function () {
        const range = { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 }
        let catalog
        before(function () { catalog = vue.createCatalog(data) })
        const labels = (items) => items.map(i => i.label)

        it('offers Vuetify and Vue tags, PascalCase when typing a capital', function () {
            labels(vue.getCompletions(monaco, catalog, { kind: 'tagName', prefix: 'v' }, range)).should.containDeep(['v-btn', 'v-menu', 'transition'])
            labels(vue.getCompletions(monaco, catalog, { kind: 'tagName', prefix: 'V' }, range)).should.containDeep(['VBtn', 'VMenu'])
        })
        it('offers props, events, directives for an attribute name', function () {
            const items = vue.getCompletions(monaco, catalog, { kind: 'attributeName', tag: 'v-btn', prefix: '' }, range)
            labels(items).should.containDeep(['variant', 'color', 'block', 'v-if', 'v-for', 'v-ripple', 'key', '@click'])
            items.find(i => i.label === 'block').insertText.should.equal('block') // boolean prop needs no value
            items.find(i => i.label === 'color').insertText.should.equal('color="$1"')
        })
        it('offers bound props for : and v-bind:', function () {
            labels(vue.getCompletions(monaco, catalog, { kind: 'attributeName', tag: 'v-btn', prefix: ':' }, range)).should.eql([':variant', ':color', ':block'])
            labels(vue.getCompletions(monaco, catalog, { kind: 'attributeName', tag: 'VBtn', prefix: 'v-bind:co' }, range)).should.containDeep(['v-bind:color'])
        })
        it('offers component and DOM events for @', function () {
            const items = labels(vue.getCompletions(monaco, catalog, { kind: 'attributeName', tag: 'v-menu', prefix: '@' }, range))
            items[0].should.equal('@update:model-value')
            items.should.containDeep(['@click', '@keydown'])
        })
        it('offers the parent component slots on a <template>', function () {
            const items = vue.getCompletions(monaco, catalog, { kind: 'attributeName', tag: 'template', prefix: '#', textBeforeTag: '<v-menu>\n  ' }, range)
            labels(items).should.eql(['#activator', '#default'])
        })
        it('offers literal values for a plain prop', function () {
            labels(vue.getCompletions(monaco, catalog, { kind: 'attributeValue', tag: 'v-btn', attribute: 'variant', prefix: '' }, range)).should.eql(['flat', 'text', 'outlined'])
            vue.getCompletions(monaco, catalog, { kind: 'attributeValue', tag: 'v-btn', attribute: ':variant', prefix: '' }, range).should.be.empty()
        })
        it('returns nothing for unknown components', function () {
            labels(vue.getCompletions(monaco, catalog, { kind: 'attributeName', tag: 'my-widget', prefix: ':' }, range)).should.be.empty()
        })
    })

    describe('getHover', function () {
        let catalog
        before(function () { catalog = vue.createCatalog(data) })

        it('describes props, events, slots and directives', function () {
            vue.getHover(catalog, 'variant', { kind: 'attributeName', tag: 'v-btn' }).should.match(/\*\*variant\*\* \(v-btn prop\)[\s\S]*Applies a distinct style[\s\S]*Default: `'elevated'`[\s\S]*vuetifyjs\.com\/api\/v-btn#props/)
            vue.getHover(catalog, ':color', { kind: 'attributeName', tag: 'v-btn' }).should.match(/\*\*color\*\*/)
            vue.getHover(catalog, '@update:model-value', { kind: 'attributeName', tag: 'v-menu' }).should.match(/v-menu event/)
            vue.getHover(catalog, '#activator', { kind: 'attributeName', tag: 'template', textBeforeTag: '<v-menu>' }).should.match(/v-menu slot/)
            vue.getHover(catalog, 'v-if', { kind: 'attributeName', tag: 'v-btn' }).should.match(/vuejs\.org\/api\/built-in-directives\.html#v-if/)
            vue.getHover(catalog, 'v-btn', { kind: 'tagName' }).should.match(/vuetifyjs\.com\/api\/v-btn/)
        })
        it('returns null for unknown names', function () {
            should(vue.getHover(catalog, 'nope', { kind: 'attributeName', tag: 'v-btn' })).be.null()
            should(vue.getHover(catalog, 'variant', null)).be.null()
        })
    })
})
