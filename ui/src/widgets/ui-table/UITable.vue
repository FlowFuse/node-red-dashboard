<template>
    <v-data-table class="nrdb-table" :items="messages[id]?.payload" :items-per-page="itemsPerPage">
        <template v-if="itemsPerPage === 0" #bottom />
    </v-data-table>
</template>

<script>

import { useDataTracker } from '../data-tracker.mjs' // eslint-disable-line import/order
import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUITable',
    inject: ['$socket'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) }
    },
    setup (props) {
        useDataTracker(props.id)
    },
    data () {
        return {
            input: {},
            isValid: null,
            pagination: {
                page: 1,
                pages: 0,
                rows: []
            }
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        columns () {
            if (this.props.autocols) {
                if (this.messages[this.id]?.payload) {
                    // loop over data and get keys
                    const cols = []
                    for (const row of this.messages[this.id].payload) {
                        Object.keys(row).forEach((key) => {
                            if (!cols.includes(key)) {
                                cols.push(key)
                            }
                        })
                    }
                    return cols.map((col) => {
                        return { key: col, title: col }
                    })
                } else {
                    return [{
                        key: '', title: ''
                    }]
                }
            } else if (this.props.columns) {
                return this.props.columns
            } else {
                // even if auto cols is off, but we have no columns defined, still have a fall back
                return [{
                    key: '', title: ''
                }]
            }
        },
        rows () {
            // store full set of data rows
            if (this.messages[this.id]?.payload) {
                return this.messages[this.id].payload
            } else {
                return undefined
            }
        },
        itemsPerPage () {
            return this.props.maxrows || 0
        }
    },
    watch: {
        rows: {
            handler () {
                this.calculatePaginatedRows()
            }
        },
        'pagination.page': {
            handler () {
                this.calculatePaginatedRows()
            }
        },
        'props.maxrows': {
            handler () {
                this.calculatePaginatedRows()
            }
        }
    },
    mounted () {
        this.calculatePaginatedRows()
    },
    methods: {
        calculatePaginatedRows () {
            if (this.props.maxrows > 0) {
                this.pagination.pages = Math.ceil(this.rows?.length / this.props.maxrows)
                this.pagination.rows = this.rows?.slice(
                    (this.pagination.page - 1) * this.props.maxrows,
                    (this.pagination.page) * this.props.maxrows
                )
            } else {
                this.pagination.page = 1
                this.pagination.pages = 0
                this.pagination.rows = this.rows
            }
        }
    }
}
</script>

<style>
.nrdb-table-nodata {
    text-align: center;
}
.nrdb-table-nodata td {
    opacity: 0.5;
}
.nrdb-table.v-data-table .v-table__wrapper>table>thead>tr>th.v-data-table__th--sortable:hover,
.nrdb-table.v-data-table .v-table__wrapper>table tbody>tr>th.v-data-table__th--sortable:hover
{
    color: rgba(var(--v-theme-on-group-background), var(--v-high-emphasis-opacity));
}
</style>
