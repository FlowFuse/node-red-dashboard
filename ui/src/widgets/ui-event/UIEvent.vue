<script>
import { mapState } from 'vuex'
import { useDataTracker } from '../data-tracker.js' // eslint-disable-line import/order
export default {
    name: 'DBUIEvent',
    inject: ['$socket'],
    beforeRouteUpdate (to, from) {
        this.pageview(to)
    },
    beforeRouteLeave (to, from) {
        this.pageleave(from)
    },
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
            const page = { ...this.page }
            // re-map _users > _groups for better data readability
            page._groups = page._users
            delete page._users
            // form event data object
            const msg = {
                page
            }
            console.log('trigger', evt, msg)
            this.$socket.emit('ui-event', evt, msg)
        }
    }
}
</script>