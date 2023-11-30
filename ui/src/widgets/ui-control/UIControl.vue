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
        ...mapState('ui', ['pages', 'groups', 'widgets']),
        ...mapGetters('ui', ['findBy'])
    },
    mounted () {
        const vue = this
        // listen for messages
        this.$socket.on('ui-control:' + this.id, (msg) => {
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
                let page = msg.tab || msg.page
                const pages = Object.values(this.pages).sort((a, b) => {
                    return a.order - b.order
                })
                if (typeof page === 'number') {
                    // we have a number, which should link to an index of the page, i.e. 0 = first page, etc.
                    if (page < 0 || page > pages.length - 1) {
                        // out of range
                        console.error('ui-control: page index out of range')
                        return
                    } else {
                        // navigate to the tab/page
                        try {
                            this.$router.push({ name: `Page:${pages[page].name}` })
                        } catch (err) {
                            console.error(err)
                        }
                    }
                } else if (typeof page === 'string') {
                    // get current index of existing page
                    const index = pages.findIndex((p) => {
                        return p.id === this.$route.meta.id
                    })
                    // we have a string, which should link to a page name
                    if (page === '') {
                        // refresh the current view
                        this.$router.go()
                        return
                    } else {
                        if (page === '+1') {
                            // get next page
                            if (pages.length === index + 1) {
                                // we are on the last page, so go to the first page
                                page = pages[0].name
                            } else {
                                // we are not on the last page, so go to the next page
                                page = pages[index + 1].name
                            }
                        } else if (page === '-1') {
                            // get next page
                            if (index === 0) {
                                // we are on the last page, so go to the first page
                                page = pages[pages.length - 1].name
                            } else {
                                // we are not on the last page, so go to the next page
                                page = pages[index - 1].name
                            }
                        }
                        // navigate to the tab/page
                        try {
                            this.$router.push({ name: `Page:${page}` })
                        } catch (err) {
                            console.error(err)
                        }
                    }
                } else {
                    // we don't support any other types
                    console.error('ui-control: page must be a string or number')
                    return
                }
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
