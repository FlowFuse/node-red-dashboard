<script>
import { mapGetters, mapState } from 'vuex'

export default {
    name: 'DBUIControl',
    inject: ['$socket', '$dataTracker'],
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
        ...mapGetters('ui', ['findBy', 'pageById'])
    },
    watch: {
        '$route.meta.id': {
            handler (val) {
                // this only fire if we switch between two pages of the same layout type,
                // the full component isn't torn down, so we can watch for changes
                this.routeChanged()
            }
        }
    },
    mounted () {
        // if this is being built, then we';ve just loaded a new page
        this.routeChanged()
        const vue = this
        // listen for messages
        this.$socket.on('ui-control:' + this.id, (msg) => {
            const payload = msg.payload

            function set (type, id, prop, value) {
                if (type === 'widget') {
                    vue.$store.commit('ui/widgetState', {
                        widgetId: id,
                        config: {
                            [prop]: value
                        }
                    })
                } else {
                    vue.$store.commit('ui/setProperty', {
                        item: type,
                        itemId: id,
                        property: prop,
                        value
                    })
                }
            }

            if ('page' in payload) {
                let page = payload.tab || payload.page
                const query = payload.query
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
                    this.$router.push({
                        name: `Page:${page}`,
                        query
                    })
                } catch (err) {
                    console.error(err)
                }
            }

            // Pages
            payload.pages?.show?.forEach(pageId => set('page', pageId, 'visible', true))
            payload.pages?.hide?.forEach(pageId => set('page', pageId, 'visible', false))
            payload.pages?.disable?.forEach(pageId => set('page', pageId, 'disabled', true))
            payload.pages?.enable?.forEach(pageId => set('page', pageId, 'disabled', false))

            // Groups
            const handleVisibility = (id, group, visibility) => {
                if (group?.groupType === 'dialog') {
                    set('group', id, 'showDialog', `${visibility}-${Date.now().toString()}`)
                } else {
                    set('group', id, 'visible', visibility === 'true')
                }
            }

            payload.groups?.show?.forEach(id => handleVisibility(id, vue.groups?.[id], 'true'))
            payload.groups?.hide?.forEach(id => handleVisibility(id, vue.groups?.[id], 'false'))
            payload.groups?.disable?.forEach(id => set('group', id, 'disabled', true))
            payload.groups?.enable?.forEach(id => set('group', id, 'disabled', false))

            // Widgets
            payload.widgets?.show?.forEach(id => set('widget', id, 'visible', true))
            payload.widgets?.hide?.forEach(id => set('widget', id, 'visible', false))
            payload.widgets?.disable?.forEach(id => set('widget', id, 'disabled', true))
            payload.widgets?.enable?.forEach(id => set('widget', id, 'disabled', false))

            if ('url' in payload) {
                if ('target' in payload) {
                    // Open the link in a new browser window or tab
                    window.open(payload.url, payload.target)
                } else {
                    // Open the link in the same window
                    window.location.href = payload.url
                }
            }
        })
    },
    unmounted () {
        this.$socket.off('ui-control')
    },
    methods: {
        routeChanged () {
            const pages = Object.values(this.pages).sort((a, b) => {
                return a.order - b.order
            })
            const index = pages.findIndex((p) => {
                return p.id === this.$route.meta.id
            })
            this.$socket.emit('ui-control', this.id, 'change', {
                page: index,
                name: this.pages[this.$route.meta.id].name
            })
        }
    }
}
</script>
