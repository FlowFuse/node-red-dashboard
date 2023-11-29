<script>
import { mapGetters, mapState } from 'vuex'

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
        ...mapState('ui', ['groups', 'widgets']),
        ...mapGetters('ui', ['findBy'])
    },
    mounted () {
        // listen for messages
        this.$socket.on('ui-control', (msg) => {
            if ('page' in msg) {
                const page = msg.page || msg.tab
                // navigate to the tab/page
                try {
                    this.$router.push({ name: `Page:${page}` })
                } catch (err) {
                    console.error(err)
                }
            }

            if ('pages' in msg) {
                if ('show' in msg.pages) {
                    // we are setting visibility: true
                    msg.pages.show.forEach((pageName) => {
                        const p = this.findBy('page', 'name', pageName)
                        this.$store.commit('ui/setProperty', {
                            item: 'page',
                            itemId: p.id,
                            property: 'visible',
                            value: true
                        })
                    })
                }
                if ('hide' in msg.pages) {
                    // we are setting visibility: false
                    msg.pages.hide.forEach((pageName) => {
                        const p = this.findBy('page', 'name', pageName)
                        this.$store.commit('ui/setProperty', {
                            item: 'page',
                            itemId: p.id,
                            property: 'visible',
                            value: false
                        })
                    })
                }
            }
        })
    },
    unmounted () {
        this.$socket.off('ui-control')
    }
}
</script>
