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
        const vue = this
        // listen for messages
        this.$socket.on('ui-control', (msg) => {
            function set (type, name, prop, value) {
                const item = vue.findBy(type, 'name', name)
                vue.$store.commit('ui/setProperty', {
                    item: type,
                    itemId: item.id,
                    property: prop,
                    value
                })
            }

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
                    msg.pages.show.forEach((name) => {
                        set('page', name, 'visible', true)
                    })
                }
                if ('hide' in msg.pages) {
                    // we are setting visibility: false
                    msg.pages.hide.forEach((pageName) => {
                        set('page', name, 'visible', false)
                    })
                }
                if ('disable' in msg.pages) {
                    // we are setting visibility: true
                    msg.pages.disable.forEach((name) => {
                        set('page', name, 'disabled', true)
                    })
                }
                if ('enable' in msg.pages) {
                    // we are setting visibility: false
                    msg.pages.enable.forEach((name) => {
                        set('page', name, 'disabled', false)
                    })
                }
            }

            if ('groups' in msg) {
                if ('show' in msg.groups) {
                    // we are setting visibility: true
                    msg.groups.show.forEach((name) => {
                        set('group', name, 'visible', true)
                    })
                }
                if ('hide' in msg.groups) {
                    // we are setting visibility: false
                    msg.groups.hide.forEach((name) => {
                        set('group', name, 'visible', false)
                    })
                }
                if ('disable' in msg.groups) {
                    // we are setting visibility: true
                    msg.groups.disable.forEach((name) => {
                        set('group', name, 'disabled', true)
                    })
                }
                if ('enable' in msg.groups) {
                    // we are setting visibility: false
                    msg.groups.enable.forEach((name) => {
                        set('group', name, 'disabled', false)
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
