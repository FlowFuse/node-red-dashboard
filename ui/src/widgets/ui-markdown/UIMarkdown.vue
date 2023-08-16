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
            template: `<div class="nrdb-ui-markdown">${DOMPurify.sanitize(md)}</div>`,
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
