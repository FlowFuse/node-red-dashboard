<template>
    <!-- <div ref="markdown" class="nrdb-ui-markdown-content" v-html="content" /> -->
    <div ref="markdown" class="nrdb-ui-markdown-content">
        <component :is="content" v-if="content" :id="id" :props="props" :msg="msg" />
    </div>
</template>

<script>
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import { marked } from 'marked'
import mermaid from 'mermaid'
import { h } from 'vue'
import { mapGetters, mapState } from 'vuex' // eslint-disable-line import/order

import { useDataTracker } from '../data-tracker.mjs'

import { escapeHTML } from './../../util.mjs'

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
    data () {
        return {
            content: null
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        msg () {
            return this.messages[this.id] || {}
        }
    },
    watch: {
        'props.content': function () {
            // when the node's config changes, re-render the content
            this.parseContent()
            this.renderMermaid()
        }
    },
    created () {
        // can't do this in setup as we have custom onInput function
        useDataTracker(this.id, this.onMsgInput, this.onMsgLoad)
        // make sure we render something on first creation
        this.parseContent()
        this.renderMermaid()
    },
    errorCaptured: (err, vm, info) => {
        console.error('errorCaptured', err, vm, info)
        return false
    },
    methods: {
        onMsgLoad: function (msg) {
            this.$store.commit('data/bind', {
                widgetId: this.id,
                msg
            })
            // if we're loading a msg from history,
            // re-load the content to account for any new msg values
            this.parseContent()
            this.renderMermaid()
        },
        onMsgInput: function (msg) {
            // compare new msg and old message
            // Mermaid doesn't like being told to re-render with the _exact_ same content,
            // so we need to check here before we update the store and trigger re-render
            if (this.msgChanged(this.$store.state.data.messages[this.id], msg)) {
                // but most of the time, we just care about the value of msg
                this.$store.commit('data/bind', {
                    widgetId: this.id,
                    msg
                })
            }
            // when we receive a new msg, re-render the content
            this.parseContent()
            this.renderMermaid()
        },
        msgChanged (oldMsg, newMsg) {
            const ignoreKeys = ['_event', '_msgid']
            if (!oldMsg) {
                return true
            }
            if (Object.keys(oldMsg).length !== Object.keys(newMsg).length) {
                return true
            }
            for (const key of Object.keys(oldMsg)) {
                if (!ignoreKeys.includes(key) && oldMsg[key] !== newMsg[key]) {
                    return true
                }
            }
        },
        parseContent () {
            // handle {{ variable || 'placeholder' }} case where || is parsed as a table
            const content = this.props.content.replace(/\|\|/g, 'mdORmd')
            // convert to markdown
            let md = marked.parse(content)
            // re-inject our || into the {{ }} where appropriate
            md = md.replaceAll('mdORmd', '||')
            const purified = DOMPurify.sanitize(md)

            // make a new child component of parsed markdown & mermaid
            const markdownComponent = {
                props: {
                    id: { type: String, required: true },
                    props: { type: Object, default: () => ({}) },
                    msg: { type: Object, default: () => ({}) }
                },
                template: `<div ref="markdown" class="nrdb-ui-markdown-content">${purified}</div>`
            }

            this.content = markdownComponent
        },
        renderMermaid () {
            this.$nextTick(() => {
                if (this.$refs.markdown) {
                    // remove the flag that mermaid uses to work out if an element has been processed
                    this.$refs.markdown?.querySelector('.mermaid')?.removeAttribute('data-processed')
                }
                // let Vue render the dynamic markdown first, then re-render the chart
                mermaid.run({
                    querySelector: '.mermaid',
                    suppressErrors: true
                })
            })
        }
    }
}
</script>
<style>
    /* import hljs css */
    @import 'highlight.js/styles/default.css';
</style>
