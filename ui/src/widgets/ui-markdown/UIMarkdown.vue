<script>
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import 'highlight.js/styles/default.css'
import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'

import { h } from 'vue'
import { mapGetters, mapState } from 'vuex' // eslint-disable-line import/order

import { useDataTracker } from '../data-tracker.js'

marked.use(markedHighlight({
    langPrefix: 'hljs language-',
    highlight (code, lang) {
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
        useDataTracker(props.id)
        return () => h({
            props: ['id', 'props'],
            errorCaptured: (err, vm, info) => {
                console.error('errorCaptured', err, vm, info)
                return false
            },
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
    /* import hljs css */
    @import 'highlight.js/styles/default.css';
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
