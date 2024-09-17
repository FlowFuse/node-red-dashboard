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
    mounted () {
        window.addEventListener('resize', () => {
            this.countColumns()
        })
        this.countColumns()
    },
    methods: {
        countColumns () {
            let cols = 0
            if (this.page) {
                const b = this.page.breakpoints
                // ensure breakpoints are sorted in reverse order
                const breakpoints = b.sort((a, b) => a.px - b.px)

                breakpoints.forEach((bp) => {
                    if (window.innerWidth >= bp.px) {
                        cols = bp.cols
                    }
                })
            }
            this.columns = cols
            console.log('columns', this.columns)
        }
    }
}
