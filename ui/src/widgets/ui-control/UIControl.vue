<script>
import { mapState } from 'vuex'

export default {
    name: 'DBUIControl',
    inject: ['$socket'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) }
    },
    data () {
        return {

        }
    },
    computed: {
        ...mapState('data', ['messages']),
        ...mapState('ui', ['groups', 'widgets'])
    },
    mounted () {
        // listen for messages
        this.$socket.on('ui-control', (msg) => {
            if ('tab' in msg || 'page' in msg) {
                const page = msg.page || msg.tab
                // navigate to the tab/page
                try {
                    this.$router.push({ name: `Page:${page}` })
                } catch (err) {

                }
            }
        })
    },
    unmounted () {
        this.$socket.off('ui-control')
    }
}
</script>
