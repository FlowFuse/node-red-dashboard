<script>

// eslint-disable vue/one-component-per-file

import { h } from 'vue'

import { useDataTracker } from '../data-tracker.js' // eslint-disable-line import/order
import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUITemplate',
    inject: ['$socket'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) }
    },
    setup (props) {
        // check if we have any addiitonal methods defined
        // commonly used by 3rd party widgets
        const methods = {}
        if (props.props.methods) {
            Object.entries(props.props.methods).forEach((entry, index) => {
                // eslint-disable-next-line no-unused-vars
                const key = entry[0]
                const value = entry[1]
                // eslint-disable-next-line no-eval
                eval('methods[key] = ' + value)
            })
        }

        useDataTracker(props.id)
        return () => h({
            props: ['id', 'props'],
            inject: ['$socket'],
            errorCaptured: (err, vm, info) => {
                console.error('errorCaptured', err, vm, info)
                return false
            },
            head () {
                let _props = this.props || props
                if (_props.props) { _props = _props.props }

                const setup = {}

                if (!_props || _props.templateScope === 'local') {
                    if (!_props.head) {
                        return {}
                    } else if (Array.isArray(_props.head) && _props.head.length > 0) {
                        // loop through the head items and add them to the setup config
                        _props.head.forEach((item) => {
                            // check that we have a data object defining the properties of the tag
                            if (item.data) {
                                // types supported by @unhead/vue:
                                //      script, link, meta, style
                                setup[item.type] = setup[item.type] || []

                                // add meta data for debugging and auditing
                                item.data['data-template-name'] = _props.name
                                item.data['data-template-scope'] = _props.templateScope
                                item.data['data-template-id'] = this.id

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
                // future?
                // if (_props.format && (_props.templateScope === 'page:script' || _props.templateScope === 'site:script')) {
                //     setup.script = [{ textContent: _props.format, id: `${_props.name || _props.templateScope}-${_props.id}` }]
                // }
                // if (hasProperty(_props, 'script')) {
                //     setup.script = [_props.head.script]
                // }
                // if (hasProperty(_props, 'meta')) {
                //     setup.meta = [_props.head.meta]
                // }
                // if (hasProperty(_props, 'link')) {
                //     setup.link = [_props.head.link]
                // }
                return setup
            },
            template: props.props.templateScope !== 'local' ? undefined : props.props.format,
            computed: {
                ...mapState('data', ['messages']),
                msg () {
                    return this.messages[this.id] || {}
                }
            },
            methods: {
                send (msg) {
                    this.$parent.send(this, msg)
                },
                submit ($evt) {
                    this.$parent.submit(this, $evt)
                },
                ...methods
            },
            mounted () {
                // if we have an onInput event handler, setup a subscription on SocketIO to ensure we catch the events
                if (this.props.onInput) {
                    // eslint-disable-next-line no-eval
                    eval(`this.$socket.on('msg-input:${this.id}', ${this.props.onInput})`)
                }
                if (this.props.onMounted) {
                    // eslint-disable-next-line no-eval
                    eval(`const onMounted = ${this.props.onMounted}; onMounted();`)
                }
            },
            unmounted () {
                // if we have an onInput event handler, remove the subscription on SocketIO
                if (this.props.onInput) {
                    // eslint-disable-next-line no-eval
                    this.$socket.off(`msg-input:${this.id}`)
                }
            }
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
            msg._dashboard = msg._dashboard || {}
            msg._dashboard.sourceId = component.id
            msg._dashboard.templateId = this.id
            this.$socket.emit('widget-action', this.id, msg) // TODO: should we have a widget-send emitter to differentiate from action?
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
