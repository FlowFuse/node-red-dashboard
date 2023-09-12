<script>
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import 'highlight.js/styles/default.css'
import { marked } from 'marked'
import mermaid from 'mermaid'
import { h } from 'vue'
import { mapGetters, mapState } from 'vuex' // eslint-disable-line import/order

import { useDataTracker } from '../data-tracker.js'

import { escapeHTML } from './../../util.js'

// set up mermaid
/** @type {import('mermaid').MermaidConfig} */
const config = {
    securityLevel: 'loose',
    startOnLoad: false,
    class: 'mermaid',
    // theme: this.theme, // TODO: add theme support
    flowchart: {
        curve: 'linear'
    },
    darkMode: false // TODO: add dark mode support
}
mermaid.initialize(config)

const customRenderer = {
    name: 'code',
    renderer (token) {
        const { lang, text } = token
        // wrap mermaid in a pre tag with class "mermaid" for the mermaid renderer to pick up
        if (lang === 'mermaid') {
            return `<pre class="mermaid">${text}</pre>`
        }
        // wrap all other code in a pre tag with hljs language-<lang> class for hljs to pick up
        const language = hljs.getLanguage(lang) ? lang : 'plaintext'
        const classAttr = ` class="hljs language-${escapeHTML(language)}"`
        const sanitisedText = text.replace(/\n$/, '')
        const code = hljs.highlight(sanitisedText, { language }).value
        return `<pre><code class="hljs language-${classAttr}">${code}\n</code></pre>`
    }
}

marked.use({ extensions: [customRenderer] })

export default {
    name: 'DBUIMarkdown',
    inject: ['$socket'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) }
    },
    setup (props) {
        useDataTracker(props.id)

        // handle {{ variable || 'placeholder' }} case where || is parsed as a table
        const content = props.props.content.replace(/\|\|/g, 'mdORmd')
        // convert to markdown
        let md = marked.parse(content)
        // reinject our || into the {{ }} where appropriate
        md = md.replaceAll('mdORmd', '||')
        return () => h({
            props: ['id', 'props'],
            errorCaptured: (err, vm, info) => {
                console.error('errorCaptured', err, vm, info)
                return false
            },
            template: `<div class="nrdb-ui-markdown-content">${DOMPurify.sanitize(md)}</div>`,
            computed: {
                ...mapState('data', ['messages']),
                ...mapGetters('data', ['getMsgProperty']),
                msg () {
                    if (this.messages[this.id]) {
                        // re-render chart with new input
                        this.renderMermaid()
                    }
                    return this.messages[this.id] || {}
                }
            },
            mounted () {
                this.renderMermaid()
            },
            methods: {
                get (path, defaultValue) {
                    return this.getMsgProperty(this.id, path, defaultValue)
                },
                renderMermaid () {
                    // remove hte flag that mermaid uses to work out if an element has been processed
                    // TODO: need to scope this to _just_ this component, otherwise it'll run for all mermaid charts on the page
                    document.getElementsByClassName('mermaid')[0]?.removeAttribute('data-processed')
                    this.$nextTick(() => {
                        // let Vue render the dynamic markdown first, then re-render the chart
                        mermaid.run({
                            querySelector: '.mermaid',
                            suppressErrors: true
                        })
                    })
                }
            }
        }, {
            id: props.id,
            props: props.props
        })
    },
    computed: {
        ...mapState('data', ['messages'])
    },
    errorCaptured: (err, vm, info) => {
        console.error('errorCaptured', err, vm, info)
        return false
    }
}
</script>
<style>
    /* import hljs css */
    @import 'highlight.js/styles/default.css';
</style>
