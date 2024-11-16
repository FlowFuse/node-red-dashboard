<script>

import { h } from 'vue'

import VueParser from '../../util/vue.acorn.js'

import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUITemplate',
    inject: ['$socket', '$dataTracker'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) }
    },
    setup (props) {
        const parser = new DOMParser()
        const htmlDoc = parser.parseFromString(props.props.format, 'text/html')

        // check whether we have a fully defined Vue component, or _just_ HTML
        const templates = htmlDoc.getElementsByTagName('template')
        const template = templates.length ? templates[0] : props.props.format

        let head

        /* Check for any CSS <style> tags */
        const styles = htmlDoc.getElementsByTagName('style')

        if (styles.length) {
            // parse the CSS and add to the head
            for (let s = 0; s < styles.length; s++) {
                const style = styles[s]
                head = head || []
                head.push({
                    type: 'style',
                    data: {
                        innerHTML: style.innerHTML
                    }
                })
            }
        }

        /* Check for any <script> elements */
        const scripts = htmlDoc.getElementsByTagName('script')
        let component

        if (scripts.length) {
            // parse the Vue component, which is mostly stringified
            for (let s = 0; s < scripts.length; s++) {
                const script = scripts[s]
                // check we're loading of a script file or if it's raw JS/Vue, or a
                if (script.getAttribute('src')) {
                    head = head || []
                    head.push({
                        type: 'script',
                        data: {
                            src: script.getAttribute('src'),
                            defer: script.getAttribute('defer'),
                            async: script.getAttribute('async')
                        }
                    })
                } else {
                    const parsed = VueParser.parse(script.innerHTML)
                    if (parsed.js) {
                        component = {
                            ...component,
                            js: parsed.js
                        }
                    } else {
                        component = {
                            ...component,
                            ...parsed
                        }
                    }
                }
            }
        }

        // here we inject the UI Template Vue Template code into our own, in order to extend base functionality
        return () => h({
            props: ['id', 'props'],
            inject: ['$socket', '$dataTracker'],
            errorCaptured: (err, vm, info) => {
                console.error('errorCaptured', err, vm, info)
                return false
            },
            head () {
                let _props = this.props || props
                if (_props.props) { _props = _props.props }

                const setup = {}

                if (!_props || ['local', 'widget:page', 'widget:ui'].includes(_props.templateScope)) {
                    if (!head) {
                        return {}
                    } else if (Array.isArray(head) && head.length > 0) {
                        // loop through the head items and add them to the setup config
                        head.forEach((item) => {
                            // check that we have a data object defining the properties of the tag
                            if (item.data) {
                                // types supported by @unhead/vue:
                                //      script, link, meta, style
                                setup[item.type] = setup[item.type] || []

                                // add meta data for debugging and auditing
                                item.data['data-template-name'] = _props.name
                                item.data['data-template-scope'] = _props.templateScope
                                item.data['data-template-id'] = this.id
                                if (_props.innerHTML) {
                                    item.data.innerHTML = _props.innerHTML
                                }

                                setup[item.type].push(item.data)
                            }
                        })
                    }
                }
                if (_props.format && (_props.templateScope === 'page:style' || _props.templateScope === 'site:style')) {
                    setup.style = [
                        {
                            innerHTML: _props.format,
                            'data-template-name': _props.name,
                            'data-template-scope': _props.templateScope,
                            'data-template-id': this.id
                        }
                    ]
                }
                return setup
            },
            template: ['local', 'widget:page', 'widget:ui'].includes(props.props.templateScope) ? template : undefined,
            watch: {
                ...component?.watch
            },
            computed: {
                ...mapState('data', ['messages']),
                ...mapState('setup', ['setup']),
                msg () {
                    return this.messages[this.id] || {}
                },
                value: {
                    get () {
                        return this.messages[this.id]?.payload
                    },
                    set (val) {
                        if (this.value === val) {
                            return // no change
                        }
                        const msg = this.messages[this.id] || {}
                        msg.payload = val
                        this.messages[this.id] = msg
                    }
                },
                ...component?.computed
            },
            methods: {
                send (msg) {
                    if (msg) {
                        this.$parent.send(this, msg)
                    }
                },
                submit ($evt) {
                    this.$parent.submit(this, $evt)
                },
                ...component?.methods
            },
            created () {
                this.$dataTracker(props.id)
            },
            mounted () {
                if (component?.js) {
                    // run any generic JS code user has defined outside of a VueJS component
                    // eslint-disable-next-line no-eval
                    eval(component.js)
                }
                if (component?.mounted) {
                    component.mounted.call(this)
                }
            },
            unmounted () {
                // eslint-disable-next-line no-eval
                this.$socket.off(`msg-input:${this.id}`)
                if (component?.unmounted) {
                    component.unmounted.call(this)
                }
            },
            data: component ? component.data : null
        }, {
            id: props.id,
            props: props.props
        })
    },
    errorCaptured: (err, vm, info) => {
        console.error('errorCaptured', err, vm, info)
        return false
    },
    methods: {
        send (component, msg) {
            if (typeof (msg) !== 'object') {
                msg = { payload: msg }
            }
            msg._dashboard = msg._dashboard || {}
            msg._dashboard.sourceId = component.id
            msg._dashboard.templateId = this.id
            this.$socket.emit('widget-send', this.id, msg) // widget-change will store msg state server-side
        },
        submit (component, $evt) {
            // extract the form names and values from $evt.target & generate a msg
            // where the payload is an object of name/value pairs
            // and the topic is the event type (e.g. 'submit')
            const formData = new FormData($evt.target)
            const msg = {
                topic: $evt.type,
                payload: Object.fromEntries(formData.entries())
            }
            msg._dashboard = msg._dashboard || {}
            msg._dashboard.sourceId = component.id
            msg._dashboard.templateId = this.id
            this.$socket.emit('widget-action', this.id, msg) // TODO: should we have a widget-send emitter to differentiate from action?
        }
    }
}
</script>

<style scoped>
</style>
