import { mapState } from 'vuex'

export default {
    data () {
        return {
            columns: 0
        }
    },
    computed: {
        ...mapState('ui', ['groups', 'widgets', 'pages']),
        page: function () {
            return this.pages[this.$route.meta.id]
        }
    },
    watch: {
        page: function () {
            this.countColumns()
        }
    },
    mounted () {
        window.addEventListener('resize', () => {
            this.countColumns()
        })
        this.countColumns()
    },
    methods: {
        countColumns () {
            let cols = 0
            const defaultBreakpoints = [
                { name: 'Default', px: 0, cols: 3 },
                { name: 'Tablet', px: 576, cols: 6 },
                { name: 'Small Desktop', px: 768, cols: 9 },
                { name: 'Desktop', px: 1024, cols: 12 }
            ]
            if (this.page) {
                // set default breakpoints if none are defined
                const b = this.page.breakpoints || defaultBreakpoints
                // ensure breakpoints are sorted in reverse order
                const breakpoints = b.sort((a, b) => a.px - b.px)

                breakpoints.forEach((bp) => {
                    if (window.innerWidth >= bp.px) {
                        // ensure cols is a number
                        cols = Number(bp.cols)
                    }
                })
            }
            this.columns = cols
        }
    }
}
