<script>
import { mapState } from 'vuex'

import { useDataTracker } from '../data-tracker.mjs' // eslint-disable-line import/order
export default {
    name: 'DBUIEvent',
    inject: ['$socket'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) }
    },
    data () {
        return {
            page: null
        }
    },
    computed: {
        ...mapState('ui', ['pages'])
    },
    watch: {
        '$route.meta.id': {
            handler (val, oldVal) {
                // this only fire if we switch between two pages of the same layout type,
                // the full component isn't torn down, so we can watch for changes
                const oldMsg = this.createPayload(this.pages[oldVal])
                this.$socket.emit('ui-event', this.id, '$pageleave', oldMsg)

                const newMsg = this.createPayload(this.pages[val])
                this.$socket.emit('ui-event', this.id, '$pageview', newMsg)
            }
        }
    },
    created () {
        // can't do this in setup as we have custom onInput function
        useDataTracker(this.id, null, this.onLoad)
        this.page = this.pages[this.$route.meta.id]
        this.pageview()
    },
    unmounted () {
        this.pageleave()
    },
    methods: {
        pageview () {
            this.trigger('$pageview')
        },
        pageleave () {
            this.trigger('$pageleave')
        },
        trigger (evt) {
            const msg = this.createPayload(this.page)
            this.$socket.emit('ui-event', this.id, evt, msg)
        },
        createPayload (page) {
            page = { ...page }
            // re-map _users > _groups for better data readability
            page._groups = page._users
            delete page._users
            // form event data object
            return {
                page
            }
        }
    }
}
</script>
