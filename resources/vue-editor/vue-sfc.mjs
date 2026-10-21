/* eslint-env browser */
/**
 * Vue single file component support for Node-RED's Monaco code editor, used by the ui-template node.
 *
 * Loaded on demand by nodes/plugins/vue-editor.html the first time an editor uses the `vue-sfc` language.
 * It provides:
 *  - a Monarch tokenizer for Vue templates (directives, bindings, events, slots and {{ }} interpolation
 *    are tokenized with JavaScript embedded; <script> and <style> blocks embed JavaScript/TypeScript and CSS/SCSS/Less)
 *  - Vue and Vuetify completion and hover for tags, props, events, slots and directives, using Vuetify's
 *    web-types data for the Vuetify version bundled with the Dashboard (see scripts/build-vue-editor-data.js)
 *  - on Node-RED versions that support it, JavaScript and CSS in <script> and <style> blocks, with Dashboard's
 *    `this` types (vue-script.mjs)
 *
 * The HTML language service (completion, hover, formatting, folding from Monaco's html worker) is registered by
 * the plugin itself, because it has to be in place before the language is first used.
 * Only public Monaco APIs are used, so no change to Node-RED's vendored Monaco is needed.
 */

export const LANGUAGE_ID = 'vue-sfc'

const VUETIFY_API_URL = 'https://vuetifyjs.com/api/'
const VUE_API_URL = 'https://vuejs.org/api/'

const VOID_ELEMENTS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr']

const VUE_DIRECTIVES = [
    ['v-if', true, 'Conditionally render the element based on the truthy-ness of the expression value.', 'built-in-directives.html#v-if'],
    ['v-else-if', true, 'Denote the "else if block" for `v-if`. Can be chained.', 'built-in-directives.html#v-else-if'],
    ['v-else', false, 'Denote the "else block" for `v-if` or a `v-if` / `v-else-if` chain.', 'built-in-directives.html#v-else'],
    ['v-for', true, 'Render the element or template block multiple times based on the source data, e.g. `item in items`.', 'built-in-directives.html#v-for'],
    ['v-show', true, 'Toggle the element\'s visibility based on the truthy-ness of the expression value.', 'built-in-directives.html#v-show'],
    ['v-model', true, 'Create a two-way binding on a form input element or a component.', 'built-in-directives.html#v-model'],
    ['v-bind', true, 'Dynamically bind one or more attributes, or a component prop, to an expression. Shorthand `:`.', 'built-in-directives.html#v-bind'],
    ['v-on', true, 'Attach an event listener to the element. Shorthand `@`.', 'built-in-directives.html#v-on'],
    ['v-slot', true, 'Denote named slots or scoped slots that expect to receive props. Shorthand `#`.', 'built-in-directives.html#v-slot'],
    ['v-text', true, 'Update the element\'s text content.', 'built-in-directives.html#v-text'],
    ['v-html', true, 'Update the element\'s innerHTML. Contents are inserted as plain HTML and are not compiled as Vue templates.', 'built-in-directives.html#v-html'],
    ['v-pre', false, 'Skip compilation for this element and all its children.', 'built-in-directives.html#v-pre'],
    ['v-once', false, 'Render the element and component once only, and skip future updates.', 'built-in-directives.html#v-once'],
    ['v-memo', true, 'Memoize a sub-tree of the template, re-rendered only when the dependency array changes.', 'built-in-directives.html#v-memo'],
    ['v-cloak', false, 'Hide un-compiled template until it is ready.', 'built-in-directives.html#v-cloak']
]

const VUE_SPECIAL_ATTRIBUTES = [
    ['key', 'A hint for Vue\'s virtual DOM algorithm to identify vnodes, mostly used with `v-for`.', 'built-in-special-attributes.html#key'],
    ['ref', 'Register a reference to an element or a child component.', 'built-in-special-attributes.html#ref'],
    ['is', 'Bind dynamic components.', 'built-in-special-attributes.html#is']
]

const VUE_COMPONENTS = [
    ['template', 'Wraps a fragment, e.g. for `v-if`, `v-for` or a named slot (`<template #name>`).', 'built-in-special-elements.html#template'],
    ['component', 'A "meta component" for rendering dynamic components or elements. Use with `:is`.', 'built-in-special-elements.html#component'],
    ['slot', 'Denotes slot content outlets in templates.', 'built-in-special-elements.html#slot'],
    ['transition', 'Provides animated transition effects to a single element or component.', 'built-in-components.html#transition'],
    ['transition-group', 'Provides transition effects for multiple elements or components in a list.', 'built-in-components.html#transitiongroup'],
    ['keep-alive', 'Caches dynamically toggled components wrapped inside.', 'built-in-components.html#keepalive'],
    ['teleport', 'Renders its slot content to another part of the DOM.', 'built-in-components.html#teleport']
]

const DOM_EVENTS = ['click', 'dblclick', 'input', 'change', 'submit', 'focus', 'blur', 'keydown', 'keyup', 'mouseenter', 'mouseleave', 'contextmenu']

/* Language configuration and tokenizer are adapted from Monaco's HTML language
 * (monaco-editor esm/vs/languages/definitions/html/html.js, Copyright (c) Microsoft Corporation, MIT License) */
export function getLanguageConfiguration (monaco) {
    return {
        wordPattern: /(-?\d*\.\d\w*)|([^`~!@$^&*()=+[{\]}\\|;:'",.<>/\s]+)/g,
        comments: { blockComment: ['<!--', '-->'] },
        brackets: [['<!--', '-->'], ['<', '>'], ['{', '}'], ['(', ')']],
        autoClosingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: '\'', close: '\'' }
        ],
        surroundingPairs: [
            { open: '"', close: '"' },
            { open: '\'', close: '\'' },
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '<', close: '>' }
        ],
        onEnterRules: [
            {
                beforeText: new RegExp(`<(?!(?:${VOID_ELEMENTS.join('|')}))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
                afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
                action: { indentAction: monaco.languages.IndentAction.IndentOutdent }
            },
            {
                beforeText: new RegExp(`<(?!(?:${VOID_ELEMENTS.join('|')}))(\\w[\\w\\d-]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
                action: { indentAction: monaco.languages.IndentAction.Indent }
            }
        ],
        folding: {
            markers: {
                start: /^\s*<!--\s*#region\b.*-->/,
                end: /^\s*<!--\s*#endregion\b.*-->/
            }
        }
    }
}

// attribute names that hold a JavaScript expression: v-*, :prop, @event, #slot
const DIRECTIVE_NAME = /(?:v-[\w-]+(?::[\w\-.:[\]]*|\.[\w\-.]*)?|[:@#][\w\-.:[\]]*)/

export const language = {
    defaultToken: '',
    tokenPostfix: '.html',
    ignoreCase: true,
    tokenizer: {
        root: [
            [/<!DOCTYPE/, 'metatag', '@doctype'],
            [/<!--/, 'comment', '@comment'],
            [/(<)((?:[\w-]+:)?[\w-]+)(\s*)(\/>)/, ['delimiter', 'tag', '', 'delimiter']],
            [/(<)(script)/, ['delimiter', { token: 'tag', next: '@script' }]],
            [/(<)(style)/, ['delimiter', { token: 'tag', next: '@style' }]],
            [/(<)((?:[\w-]+:)?[\w-]+)/, ['delimiter', { token: 'tag', next: '@otherTag' }]],
            [/(<\/)((?:[\w-]+:)?[\w-]+)/, ['delimiter', { token: 'tag', next: '@otherTag' }]],
            [/</, 'delimiter'],
            [/\{\{/, { token: 'delimiter.bracket', next: '@interpolation', nextEmbedded: 'text/javascript' }],
            [/[^<{]+/], // text
            [/\{/]
        ],
        interpolation: [
            [/\}\}/, { token: 'delimiter.bracket', next: '@pop', nextEmbedded: '@pop' }]
        ],
        doctype: [
            [/[^>]+/, 'metatag.content'],
            [/>/, 'metatag', '@pop']
        ],
        comment: [
            [/-->/, 'comment', '@pop'],
            [/[^-]+/, 'comment.content'],
            [/./, 'comment.content']
        ],
        otherTag: [
            [/\/?>/, 'delimiter', '@pop'],
            [/"([^"]*)"/, 'attribute.value'],
            [/'([^']*)'/, 'attribute.value'],
            [DIRECTIVE_NAME, { token: 'attribute.name', next: '@directive' }],
            [/[\w-]+/, 'attribute.name'],
            [/=/, 'delimiter'],
            [/[ \t\r\n]+/] // whitespace
        ],
        // after a directive name: an optional ="expression" that is tokenized as JavaScript
        directive: [
            [/[ \t]*=[ \t]*/, 'delimiter'],
            [/"/, { token: 'attribute.value', next: '@expressionDoubleQuoted', nextEmbedded: 'text/javascript' }],
            [/'/, { token: 'attribute.value', next: '@expressionSingleQuoted', nextEmbedded: 'text/javascript' }],
            [/./, { token: '@rematch', next: '@pop' }]
        ],
        // the closing quote pops back to the directive state, which then pops back to the tag
        expressionDoubleQuoted: [
            [/"/, { token: 'attribute.value', next: '@pop', nextEmbedded: '@pop' }]
        ],
        expressionSingleQuoted: [
            [/'/, { token: 'attribute.value', next: '@pop', nextEmbedded: '@pop' }]
        ],

        // <script> blocks: JavaScript, or TypeScript with lang="ts"
        script: [
            [/(lang)(\s*=\s*)(["'])(ts|typescript)(["'])/, ['attribute.name', 'delimiter', 'attribute.value', 'attribute.value', { token: 'attribute.value', switchTo: '@scriptWithLanguage.typescript' }]],
            [/"([^"]*)"/, 'attribute.value'],
            [/'([^']*)'/, 'attribute.value'],
            [/[\w-]+/, 'attribute.name'],
            [/=/, 'delimiter'],
            [/>/, { token: 'delimiter', next: '@scriptEmbedded', nextEmbedded: 'text/javascript' }],
            [/[ \t\r\n]+/], // whitespace
            [/(<\/)(script\s*)(>)/, ['delimiter', 'tag', { token: 'delimiter', next: '@pop' }]]
        ],
        scriptWithLanguage: [
            [/>/, { token: 'delimiter', next: '@scriptEmbedded.$S2', nextEmbedded: '$S2' }],
            [/"([^"]*)"/, 'attribute.value'],
            [/'([^']*)'/, 'attribute.value'],
            [/[\w-]+/, 'attribute.name'],
            [/=/, 'delimiter'],
            [/[ \t\r\n]+/], // whitespace
            [/<\/script\s*>/, { token: '@rematch', next: '@pop' }]
        ],
        scriptEmbedded: [
            [/<\/script/, { token: '@rematch', next: '@pop', nextEmbedded: '@pop' }],
            [/[^<]+/, '']
        ],

        // <style> blocks: CSS, or SCSS / Less with lang="scss" / lang="less"
        style: [
            [/(lang)(\s*=\s*)(["'])(scss|less)(["'])/, ['attribute.name', 'delimiter', 'attribute.value', 'attribute.value', { token: 'attribute.value', switchTo: '@styleWithLanguage.$4' }]],
            [/"([^"]*)"/, 'attribute.value'],
            [/'([^']*)'/, 'attribute.value'],
            [/[\w-]+/, 'attribute.name'],
            [/=/, 'delimiter'],
            [/>/, { token: 'delimiter', next: '@styleEmbedded', nextEmbedded: 'text/css' }],
            [/[ \t\r\n]+/], // whitespace
            [/(<\/)(style\s*)(>)/, ['delimiter', 'tag', { token: 'delimiter', next: '@pop' }]]
        ],
        styleWithLanguage: [
            [/>/, { token: 'delimiter', next: '@styleEmbedded.$S2', nextEmbedded: '$S2' }],
            [/"([^"]*)"/, 'attribute.value'],
            [/'([^']*)'/, 'attribute.value'],
            [/[\w-]+/, 'attribute.name'],
            [/=/, 'delimiter'],
            [/[ \t\r\n]+/], // whitespace
            [/<\/style\s*>/, { token: '@rematch', next: '@pop' }]
        ],
        styleEmbedded: [
            [/<\/style/, { token: '@rematch', next: '@pop', nextEmbedded: '@pop' }],
            [/[^<]+/, '']
        ]
    }
}

/**
 * Works out what the cursor is on: a tag name, an attribute name or an attribute value.
 * Returns null when the cursor is in text content, a comment, an interpolation or a script/style block.
 * @param {string} text - the document text up to the cursor
 */
export function getCursorContext (text) {
    const lastIndexOf = (re) => {
        let index = -1
        for (const m of text.matchAll(re)) { index = m.index }
        return index
    }
    // inside a <script> or <style> block?
    if (lastIndexOf(/<(script|style)\b/gi) > lastIndexOf(/<\/(script|style)\s*>/gi)) {
        return null
    }
    // inside a comment or a {{ }} interpolation?
    if (text.lastIndexOf('<!--') > text.lastIndexOf('-->') || text.lastIndexOf('{{') > text.lastIndexOf('}}')) {
        return null
    }
    const tagStart = text.lastIndexOf('<')
    if (tagStart === -1) {
        return null
    }
    const inTag = text.slice(tagStart + 1)
    if (/^[\w-]*$/.test(inTag)) {
        return { kind: 'tagName', prefix: inTag, offset: tagStart + 1 }
    }
    const tagMatch = /^([\w-]+)/.exec(inTag)
    if (!tagMatch) {
        return null // closing tag, comment or doctype
    }
    const tag = tagMatch[1]
    const s = inTag.slice(tag.length)
    const base = tagStart + 1 + tag.length
    let i = 0
    while (i < s.length) {
        const ch = s[i]
        if (ch === '>') {
            return null // the tag is closed, the cursor is in content
        }
        if (/\s/.test(ch) || ch === '/') {
            i++
            continue
        }
        const name = /^[^\s"'=<>/]+/.exec(s.slice(i))
        if (!name) {
            i++
            continue
        }
        const nameStart = i
        i += name[0].length
        if (i >= s.length) {
            return { kind: 'attributeName', tag, prefix: name[0], offset: base + nameStart, textBeforeTag: text.slice(0, tagStart) }
        }
        let j = i
        while (j < s.length && /\s/.test(s[j])) { j++ }
        if (s[j] !== '=') {
            i = j
            continue
        }
        j++
        while (j < s.length && /\s/.test(s[j])) { j++ }
        if (j >= s.length) {
            return null // after "name=", waiting for a quote
        }
        const quote = s[j]
        if (quote === '"' || quote === '\'') {
            const end = s.indexOf(quote, j + 1)
            if (end === -1) {
                return { kind: 'attributeValue', tag, attribute: name[0], prefix: s.slice(j + 1), offset: base + j + 1 }
            }
            i = end + 1
        } else {
            i = j + /^[^\s>]*/.exec(s.slice(j))[0].length
        }
    }
    return { kind: 'attributeName', tag, prefix: '', offset: base + s.length, textBeforeTag: text.slice(0, tagStart) }
}

/**
 * Finds the element that encloses a position, i.e. the parent of a tag that starts there.
 * @param {string} text - the document text before the tag
 */
export function getParentTag (text) {
    const stack = []
    for (const m of text.matchAll(/<(\/?)([\w-]+)(?:"[^"]*"|'[^']*'|[^'">])*?(\/?)>/g)) {
        const [, closing, name, selfClosing] = m
        const tag = name.toLowerCase()
        if (selfClosing || VOID_ELEMENTS.includes(tag) || tag === 'script' || tag === 'style') {
            continue
        }
        if (closing) {
            const index = stack.lastIndexOf(tag)
            if (index !== -1) { stack.length = index }
        } else {
            stack.push(tag)
        }
    }
    return stack[stack.length - 1] || null
}

/** Converts a PascalCase or camelCase name to kebab-case (VCardActions -> v-card-actions, itemsPerPage -> items-per-page) */
export function kebab (name) {
    return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase()
}

/** Splits an attribute name into its Vue prefix and the name it refers to, e.g. ":items" -> { prefix: ":", name: "items" } */
export function splitAttributeName (attribute) {
    const m = /^(v-bind:|v-on:|v-slot:|:|@|#)?(.*)$/.exec(attribute)
    const prefix = m[1] || ''
    const name = m[2].split('.')[0] // drop modifiers
    const kind = { '': 'attribute', 'v-bind:': 'prop', ':': 'prop', 'v-on:': 'event', '@': 'event', 'v-slot:': 'slot', '#': 'slot' }[prefix]
    return { prefix, name, kind }
}

/** Extracts the string literal values from a prop type such as "'start' | 'end' | boolean" */
export function literalValues (type) {
    return [...(type || '').matchAll(/'([^']*)'/g)].map(m => m[1])
}

/**
 * Wraps the Vuetify data generated at build time with lookups by tag name.
 * @param {object} data - contents of vuetify.json
 */
export function createCatalog (data) {
    const text = (index) => (index >= 0 ? data.strings[index] : '')
    const tags = new Map()
    for (const [name, tag] of Object.entries(data?.tags || {})) {
        tags.set(name, {
            name,
            props: tag.p.map(([prop, type, description, defaultValue]) => ({ name: prop, type, description: text(description), default: defaultValue })),
            events: tag.e.map(([event, args, description]) => ({ name: event, args, description: text(description) })),
            slots: tag.s.map(([slot, description]) => ({ name: slot, description: text(description) }))
        })
    }
    const directives = (data?.directives || []).map(([name, type, description, modifiers]) => ({ name, type, description: text(description), modifiers }))
    return {
        version: data?.vuetify,
        tags,
        directives,
        getTag (name) {
            return tags.get(kebab(name || ''))
        }
    }
}

function markdown (value) {
    return { value, isTrusted: false }
}

function vuetifyLink (tag, section) {
    return `[Vuetify API reference](${VUETIFY_API_URL}${tag}${section ? '#' + section : ''})`
}

function propDocs (tag, prop) {
    const lines = []
    if (prop.type) { lines.push('```ts\n' + prop.type + '\n```') }
    if (prop.description) { lines.push(prop.description) }
    if (prop.default !== '' && prop.default !== undefined) { lines.push(`Default: \`${prop.default}\``) }
    lines.push(vuetifyLink(tag.name, 'props'))
    return lines.join('\n\n')
}

function eventDocs (tag, event) {
    const lines = []
    if (event.args) { lines.push('```ts\n(' + event.args + ') => void\n```') }
    if (event.description) { lines.push(event.description) }
    lines.push(vuetifyLink(tag.name, 'events'))
    return lines.join('\n\n')
}

function slotDocs (tag, slot) {
    return [slot.description, vuetifyLink(tag.name, 'slots')].filter(Boolean).join('\n\n')
}

function directiveDocs (directive) {
    if (directive.link) {
        return `${directive.description}\n\n[Vue API reference](${VUE_API_URL}${directive.link})`
    }
    const lines = []
    if (directive.type) { lines.push('```ts\n' + directive.type + '\n```') }
    if (directive.description) { lines.push(directive.description) }
    lines.push(vuetifyLink(directive.name + '-directive'))
    return lines.join('\n\n')
}

/**
 * Builds the completion items for a cursor context.
 * @param {object} monaco - the monaco namespace
 * @param {object} catalog - from createCatalog()
 * @param {object} context - from getCursorContext()
 * @param {object} range - the range the completion replaces
 */
export function getCompletions (monaco, catalog, context, range) {
    const { CompletionItemKind, CompletionItemInsertTextRule } = monaco.languages
    const snippet = CompletionItemInsertTextRule.InsertAsSnippet
    const items = []

    if (context.kind === 'tagName') {
        const pascal = /^[A-Z]/.test(context.prefix)
        for (const tag of catalog.tags.values()) {
            const label = pascal ? tag.name.replace(/(?:^|-)(\w)/g, (_, c) => c.toUpperCase()) : tag.name
            items.push({ label, kind: CompletionItemKind.Class, detail: `Vuetify ${catalog.version || ''}`.trim(), documentation: markdown(vuetifyLink(tag.name)), insertText: label, range, sortText: '1' + label })
        }
        for (const [name, description, link] of VUE_COMPONENTS) {
            items.push({ label: name, kind: CompletionItemKind.Module, detail: 'Vue', documentation: markdown(`${description}\n\n[Vue API reference](${VUE_API_URL}${link})`), insertText: name, range, sortText: '2' + name })
        }
        return items
    }

    if (context.kind === 'attributeValue') {
        const tag = catalog.getTag(context.tag)
        const attribute = splitAttributeName(context.attribute)
        if (!tag || attribute.kind !== 'attribute') {
            return items
        }
        const prop = tag.props.find(p => p.name === kebab(attribute.name))
        for (const value of literalValues(prop?.type)) {
            items.push({ label: value, kind: CompletionItemKind.EnumMember, detail: `${tag.name} ${prop.name}`, documentation: markdown(propDocs(tag, prop)), insertText: value, range })
        }
        return items
    }

    // attribute names
    const tag = catalog.getTag(context.tag)
    const { prefix, kind } = splitAttributeName(context.prefix)
    const add = (item) => items.push(Object.assign({ range }, item))

    if (kind === 'prop' || kind === 'attribute') {
        for (const prop of tag?.props || []) {
            const isBoolean = /^boolean$/.test(prop.type)
            const label = prefix + prop.name
            add({
                label,
                kind: CompletionItemKind.Property,
                detail: prop.type,
                documentation: markdown(propDocs(tag, prop)),
                insertText: (kind === 'attribute' && isBoolean) ? label : `${label}="$1"`,
                insertTextRules: snippet,
                sortText: '0' + prop.name
            })
        }
    }
    if (kind === 'event' || (kind === 'attribute' && !context.prefix.startsWith('v-'))) {
        const eventPrefix = kind === 'event' ? prefix : '@'
        const events = (tag?.events || []).map(e => ({ ...e, tag }))
        for (const name of DOM_EVENTS) {
            if (!events.some(e => e.name === name)) { events.push({ name, description: `DOM \`${name}\` event`, dom: true }) }
        }
        for (const event of events) {
            const label = eventPrefix + event.name
            add({
                label,
                kind: CompletionItemKind.Event,
                detail: event.dom ? 'DOM event' : `${tag.name} event`,
                documentation: markdown(event.dom ? event.description : eventDocs(tag, event)),
                insertText: `${label}="$1"`,
                insertTextRules: snippet,
                sortText: (event.dom ? '3' : '1') + event.name
            })
        }
    }
    if (kind === 'slot' || (kind === 'attribute' && context.tag.toLowerCase() === 'template')) {
        // slots belong to the component the <template> is in, or to the component itself (v-slot on a component)
        const slotPrefix = kind === 'slot' ? prefix : '#'
        const owner = context.tag.toLowerCase() === 'template' ? catalog.getTag(getParentTag(context.textBeforeTag || '')) : tag
        for (const slot of owner?.slots || []) {
            const label = slotPrefix + slot.name
            add({ label, kind: CompletionItemKind.Field, detail: `${owner.name} slot`, documentation: markdown(slotDocs(owner, slot)), insertText: label, sortText: '0' + slot.name })
        }
    }
    if (kind === 'attribute') {
        for (const [name, hasValue, description, link] of VUE_DIRECTIVES) {
            add({ label: name, kind: CompletionItemKind.Keyword, detail: 'Vue directive', documentation: markdown(directiveDocs({ name, description, link })), insertText: hasValue ? `${name}="$1"` : name, insertTextRules: snippet, sortText: '2' + name })
        }
        for (const directive of catalog.directives) {
            add({ label: directive.name, kind: CompletionItemKind.Keyword, detail: 'Vuetify directive', documentation: markdown(directiveDocs(directive)), insertText: `${directive.name}="$1"`, insertTextRules: snippet, sortText: '2' + directive.name })
        }
        for (const [name, description, link] of VUE_SPECIAL_ATTRIBUTES) {
            add({ label: name, kind: CompletionItemKind.Keyword, detail: 'Vue', documentation: markdown(directiveDocs({ name, description, link })), insertText: `${name}="$1"`, insertTextRules: snippet, sortText: '2' + name })
        }
    }
    return items
}

/**
 * Builds the hover contents for an attribute or tag name.
 * @param {object} catalog - from createCatalog()
 * @param {string} word - the tag or attribute name under the cursor
 * @param {object} context - getCursorContext() at the start of the word
 */
export function getHover (catalog, word, context) {
    if (!context) {
        return null
    }
    if (context.kind === 'tagName') {
        const tag = catalog.getTag(word)
        if (tag) {
            return `**${tag.name}** (Vuetify ${catalog.version || ''})\n\n${vuetifyLink(tag.name)}`
        }
        const vue = VUE_COMPONENTS.find(c => c[0] === word.toLowerCase())
        return vue ? `**${vue[0]}** (Vue)\n\n${vue[1]}\n\n[Vue API reference](${VUE_API_URL}${vue[2]})` : null
    }
    if (context.kind !== 'attributeName') {
        return null
    }
    const tag = catalog.getTag(context.tag)
    const { name, kind } = splitAttributeName(word)
    if (kind === 'prop' || kind === 'attribute') {
        const prop = tag?.props.find(p => p.name === kebab(name))
        if (prop) {
            return `**${prop.name}** (${tag.name} prop)\n\n${propDocs(tag, prop)}`
        }
    }
    if (kind === 'event') {
        const event = tag?.events.find(e => e.name === kebab(name))
        if (event) {
            return `**${event.name}** (${tag.name} event)\n\n${eventDocs(tag, event)}`
        }
    }
    if (kind === 'slot') {
        const owner = context.tag.toLowerCase() === 'template' ? catalog.getTag(getParentTag(context.textBeforeTag || '')) : tag
        const slot = owner?.slots.find(s => s.name === name)
        if (slot) {
            return `**${slot.name}** (${owner.name} slot)\n\n${slotDocs(owner, slot)}`
        }
    }
    if (kind === 'attribute') {
        const vue = VUE_DIRECTIVES.find(d => d[0] === name) || VUE_SPECIAL_ATTRIBUTES.find(d => d[0] === name)
        if (vue) {
            return `**${vue[0]}** (Vue)\n\n${directiveDocs({ name: vue[0], description: vue.length === 4 ? vue[2] : vue[1], link: vue[vue.length - 1] })}`
        }
        const directive = catalog.directives.find(d => d.name === name)
        if (directive) {
            return `**${directive.name}** (Vuetify directive)\n\n${directiveDocs(directive)}`
        }
    }
    return null
}

/**
 * Registers the tokenizer and the Vue/Vuetify completion and hover providers.
 * @param {object} monaco - the monaco namespace
 * @param {object} options
 * @param {string} options.dataUrl - URL of the generated vuetify.json
 */
export function activate (monaco, { dataUrl }) {
    monaco.languages.setLanguageConfiguration(LANGUAGE_ID, getLanguageConfiguration(monaco))
    monaco.languages.setMonarchTokensProvider(LANGUAGE_ID, language)

    let catalog = createCatalog(null)
    const ready = fetch(dataUrl)
        .then(res => (res.ok ? res.json() : Promise.reject(new Error(`${res.status} ${res.statusText}`))))
        .then(data => {
            catalog = createCatalog(data)
            return catalog
        })
        .catch(err => console.warn('vue-sfc: could not load Vuetify data from ' + dataUrl, err))

    const textBefore = (model, position) => model.getValueInRange({ startLineNumber: 1, startColumn: 1, endLineNumber: position.lineNumber, endColumn: position.column })

    monaco.languages.registerCompletionItemProvider(LANGUAGE_ID, {
        triggerCharacters: ['<', ':', '@', '#', '"', '\''],
        async provideCompletionItems (model, position) {
            await ready
            const context = getCursorContext(textBefore(model, position))
            if (!context) {
                return { suggestions: [] }
            }
            const start = model.getPositionAt(context.offset)
            const range = new monaco.Range(start.lineNumber, start.column, position.lineNumber, position.column)
            return { suggestions: getCompletions(monaco, catalog, context, range) }
        }
    })

    monaco.languages.registerHoverProvider(LANGUAGE_ID, {
        async provideHover (model, position) {
            await ready
            const line = model.getLineContent(position.lineNumber)
            const match = [...line.matchAll(/[\w\-:@#.[\]]+/g)].find(m => m.index < position.column && m.index + m[0].length >= position.column - 1)
            if (!match) {
                return null
            }
            const wordStart = { lineNumber: position.lineNumber, column: match.index + 1 }
            const context = getCursorContext(textBefore(model, wordStart))
            const contents = getHover(catalog, match[0], context)
            if (!contents) {
                return null
            }
            return {
                range: new monaco.Range(position.lineNumber, match.index + 1, position.lineNumber, match.index + 1 + match[0].length),
                contents: [markdown(contents)]
            }
        }
    })

    // JavaScript and CSS in <script> and <style> blocks come from Node-RED (newer versions), which this adds
    // Dashboard's `this` types to. Loaded with the same cache-busting query as this module.
    if (typeof globalThis.RED?.editor?.codeEditor?.monaco?.registerEmbeddedLanguages === 'function') {
        import(new URL('./vue-script.mjs' + new URL(import.meta.url).search, import.meta.url).href)
            .then(script => script.activate(monaco, { languageId: LANGUAGE_ID }))
            .catch(err => console.warn('vue-sfc: could not load <script> support', err))
    }

    return { ready }
}
