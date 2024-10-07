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
        ...mapGetters('ui', ['findBy', 'pageByName'])
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
            function set (type, name, prop, value) {
                const item = vue.findBy(type, 'name', name)[0]
                vue.$store.commit('ui/setProperty', {
                    item: type,
                    itemId: item.id,
                    property: prop,
                    value
                })
            }

            function setGroup (name, prop, value) {
                const [pageName, groupName] = name.split(':')
                const groups = vue.findBy('group', 'name', groupName)
                if (groups.length === 1) {
                    set('group', groupName, prop, value)
                } else {
                    const pages = vue.pageByName(pageName)
                    if (!pages.length) {
                        console.error('page not found')
                    } else {
                        const pageId = pages[0].id
                        const g = groups.find((g) => {
                            return g.page === pageId
                        })
                        if (!g) {
                            console.error(`group "${groupName}" not found on page "${pageName}"`)
                        } else {
                            vue.$store.commit('ui/setProperty', {
                                item: 'group',
                                itemId: g.id,
                                property: prop,
                                value
                            })
                        }
                    }
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

            if ('pages' in payload) {
                if ('show' in payload.pages) {
                    // we are setting visibility: true
                    payload.pages.show.forEach((pageName) => {
                        set('page', pageName, 'visible', true)
                    })
                }
                if ('hide' in payload.pages) {
                    // we are setting visibility: false
                    payload.pages.hide.forEach((pageName) => {
                        set('page', pageName, 'visible', false)
                    })
                }
                if ('disable' in payload.pages) {
                    // we are setting visibility: true
                    payload.pages.disable.forEach((pageName) => {
                        set('page', pageName, 'disabled', true)
                    })
                }
                if ('enable' in payload.pages) {
                    // we are setting visibility: false
                    payload.pages.enable.forEach((pageName) => {
                        set('page', pageName, 'disabled', false)
                    })
                }
            }

            if ('groups' in payload) {
                if ('show' in payload.groups) {
                    // we are setting visibility: true
                    payload.groups.show.forEach((name) => {
                        setGroup(name, 'visible', true)
                    })
                }
                if ('hide' in payload.groups) {
                    // we are setting visibility: false
                    payload.groups.hide.forEach((name) => {
                        setGroup(name, 'visible', false)
                    })
                }
                if ('disable' in payload.groups) {
                    // we are setting visibility: true
                    payload.groups.disable.forEach((name) => {
                        setGroup(name, 'disabled', true)
                    })
                }
                if ('enable' in payload.groups) {
                    // we are setting visibility: false
                    payload.groups.enable.forEach((name) => {
                        setGroup(name, 'disabled', false)
                    })
                }
                if ('show-dialog' in payload.groups) {
                    // we are setting showDialog: true
                    payload.groups['show-dialog'].forEach((name) => {
                        // Append the timestamp with the boolean value to
                        // detect the "show-dialog" trigger from the Vue UI,
                        // as the dialog can also be closed directly from the UI.
                        setGroup(name, 'showDialog', `true-${Date.now().toString()}`)
                    })
                }
                if ('hide-dialog' in payload.groups) {
                    // we are setting showDialog: false
                    payload.groups['hide-dialog'].forEach((name) => {
                        setGroup(name, 'showDialog', `false-${Date.now().toString()}`)
                    })
                }
            }

            if ('url' in payload) {
                // we are setting the url
                window.location.href = payload.url
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
