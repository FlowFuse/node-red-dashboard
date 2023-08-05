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
        useDataTracker(props.id)
        return () => h({
            props: ['id', 'props'],
            template: props.props.format,
            computed: {
                ...mapState('data', ['messages']),
                msg () {
                    return this.messages[this.id]
                }
            },
            methods: {
                send (msg) {
                    this.$parent.send(this, msg)
                },
                submit ($evt) {
                    this.$parent.submit(this, $evt)
                }
            }
        }, {
            id: props.id,
            props: props.props
        })
    },
    methods: {
        send (component, msg) {
            console.log('send called from template item', component, msg)
            msg._dashboard = msg._dashboard || {}
            msg._dashboard.sourceId = component.id
            msg._dashboard.templateId = this.id
            this.$socket.emit('widget-action', this.id, msg) // TODO: should we have a widget-send emitter to differentiate from action?
        },
        submit (component, $evt) {
            console.log('submit called from template item', component, $evt)
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
