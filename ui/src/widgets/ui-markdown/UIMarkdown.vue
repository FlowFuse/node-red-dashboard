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
.nrdb-ui-markdown>*:first-child {
    margin-top: 0 !important;
}
.nrdb-ui-markdown p, .nrdb-ui-markdown blockquote, .nrdb-ui-markdown ul, .nrdb-ui-markdown ol, .nrdb-ui-markdown dl, .nrdb-ui-markdown table, .nrdb-ui-markdown pre, .nrdb-ui-markdown details {
    margin-top: 0;
    margin-bottom: 16px;
}
.nrdb-ui-markdown h1, .nrdb-ui-markdown h2, .nrdb-ui-markdown h3, .nrdb-ui-markdown h4, .nrdb-ui-markdown h5, .nrdb-ui-markdown h6 {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
}
.nrdb-ui-markdown ul, .nrdb-ui-markdown ol {
    padding-left: 2em;
}
.markdown-body hr {
    height: 0.25em;
    padding: 0;
    margin: 24px 0;
    /* background-color: var(TBD) */
    border: 0;
}
.nrdb-ui-markdown ul ul, .nrdb-ui-markdown ul ol, .nrdb-ui-markdown ol ol, .nrdb-ui-markdown ol ul {
    margin-top: 0;
    margin-bottom: 0;
}
.nrdb-ui-markdown pre {
    padding: 16px;
    overflow: auto;
    font-size: 85%;
    line-height: 1.45;
    /* color: var(TBD); */
    background: #f3f3f3; /* should use theme variable? */
    border-radius: 6px;
}
.nrdb-ui-markdown blockquote {
    padding-left: 1em;
    border-left: 4px solid #d1d1d1; /* should use theme variable? */
    color: gray; /* should use theme variable? */
}
.nrdb-ui-markdown table {
    border-collapse: collapse;
    border-spacing: 0;
    margin: 0.5em 0;
    width: 100%;
    overflow: auto;
    width: max-content;
}
.nrdb-ui-markdown table th {
    font-weight: bold;
    padding: 0.5em 0.5em;
    border: 1px solid #d1d1d1; /* should use theme variable? */
}
.nrdb-ui-markdown table td {
    padding: 0.5em 0.5em;
    border: 1px solid #d1d1d1; /* should use theme variable? */
}
</style>
