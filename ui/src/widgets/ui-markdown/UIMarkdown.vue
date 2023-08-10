<script>
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'

import mermaid from 'mermaid'
import { h } from 'vue'
import { mapGetters, mapState } from 'vuex' // eslint-disable-line import/order

import { useDataTracker } from '../data-tracker.js'
marked.use({
    renderer: {
        code (code, language) {
            console.log('code', language)
            console.log('code', language)
            if (language === 'mermaid') {
                return '<pre class="mermaid">' + code + '</pre>'
            }
            return code
        }
    }
})

marked.use(markedHighlight({
    langPrefix: 'hljs language-',
    highlight (code, lang) {
        console.log('highlight', lang)
        if (lang === 'mermaid') {
            return '<pre class="mermaid">' + code + '</pre>'
        }
        const language = hljs.getLanguage(lang) ? lang : 'plaintext'
        return hljs.highlight(code, { language }).value
    }
}))

export default {
    name: 'DBUIMarkdown',
    inject: ['$socket'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) }
    },
    setup (props) {
        mermaid.initialize({
            startOnLoad: true,
            flowchart: { useMaxWidth: false, htmlLabels: true },
            class: 'mermaid-diagram',
            theme: 'default'
        })

        useDataTracker(props.id)
        return () => h({
            props: ['id', 'props'],
            errorCaptured: (err, vm, info) => {
                console.error('errorCaptured', err, vm, info)
                return false
            },
            // template: `<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/default.min.css">\n<div class="nrdb-ui-markdown">${DOMPurify.sanitize(marked.parse(props.props.content))}</div>`,
            template: `<div class="nrdb-ui-markdown">${DOMPurify.sanitize(marked.parse(props.props.content))}</div>`,
            computed: {
                ...mapState('data', ['messages']),
                ...mapGetters('data', ['getMsgProperty']),
                msg () {
                    return this.messages[this.id] || {}
                }
            },
            methods: {
                get (path, defaultValue) {
                    return this.getMsgProperty(this.id, path, defaultValue)
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
    @import '//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/default.min.css';
</style>
<style lang="css">

.nrdb-ui-markdown h1 {
    margin: 0.67em 0;
}
.nrdb-ui-markdown h2 {
    margin: 0.5em 0;
}
.nrdb-ui-markdown h3 {
    margin: 0.25em 0;
}
.nrdb-ui-markdown ul {
    padding: 0 0 0 1em;
}
.nrdb-ui-markdown p {
    margin: 0.25em 0 1em;
}
.nrdb-ui-markdown blockquote {
    padding-left: 1em;
    border-left: 4px solid #d1d1d1;
    color: gray;
}
.nrdb-ui-markdown table {
    border-collapse: collapse;
    border-spacing: 0;
    margin: 0.5em 0;
    width: 100%;
    overflow: auto;
}
.nrdb-ui-markdown table th {
    font-weight: bold;
    padding: 0.5em 0.5em;
    border: 1px solid #d1d1d1;
}
.nrdb-ui-markdown table td {
    padding: 0.5em 0.5em;
    border: 1px solid #d1d1d1;
}
</style>
