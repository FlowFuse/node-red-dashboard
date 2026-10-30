/**
 * Builds the Vuetify component data used by the ui-template code editor (resources/vue-editor).
 *
 * Source: the web-types file that Vuetify publishes in its npm package, so the editor always describes
 * the same Vuetify version that the Dashboard bundles. Output is a compact JSON file with descriptions
 * de-duplicated into a string table (many props share the same description).
 */
const fs = require('fs')
const path = require('path')

const webTypes = require('vuetify/dist/json/web-types.json')
const vuetifyPackage = require('vuetify/package.json')

const OUTPUT = path.join(__dirname, '..', 'resources', 'vue-editor', 'vuetify.json')

// VCardActions -> v-card-actions, itemsPerPage -> items-per-page, update:modelValue -> update:model-value
const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase()
const cleanType = (type) => (type || '').trim()

const strings = []
const stringIndex = new Map()
function str (text) {
    text = (text || '').trim()
    if (!text) {
        return -1
    }
    if (!stringIndex.has(text)) {
        stringIndex.set(text, strings.length)
        strings.push(text)
    }
    return stringIndex.get(text)
}

const tags = {}
for (const tag of webTypes.contributions.html.tags) {
    const props = tag.attributes.map(a => [kebab(a.name), cleanType(a.value?.type), str(a.description), a.default ?? ''])
    const events = (tag.events || []).map(e => [
        kebab(e.name),
        (e.arguments || []).map(arg => cleanType(arg.type)).join(', '),
        str(e.description)
    ])
    const slots = (tag.slots || []).map(s => [s.name, str(s.description)])
    tags[kebab(tag.name)] = { p: props, e: events, s: slots }
}

const directives = webTypes.contributions.html.attributes.map(d => [
    d.name,
    cleanType(d.value?.type),
    str(d.description),
    (d['vue-modifiers'] || []).map(m => m.name).filter(m => !m.startsWith('['))
])

const data = {
    vuetify: vuetifyPackage.version,
    strings,
    tags,
    directives
}

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
fs.writeFileSync(OUTPUT, JSON.stringify(data))
console.log(`vue-editor: wrote Vuetify ${vuetifyPackage.version} data for ${Object.keys(tags).length} components to ${path.relative(process.cwd(), OUTPUT)}`)
