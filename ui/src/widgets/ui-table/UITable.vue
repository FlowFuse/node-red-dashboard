<template>
    <div>
        <v-table class="nrdb-table">
            <thead>
                <tr>
                    <th v-for="(col, $index) in columns" :key="$index" class="text-left">{{ col.label }}</th>
                </tr>
            </thead>
            <tbody v-if="rows">
                <tr
                    v-for="(row, $index) in pagination.rows"
                    :key="$index"
                >
                    <td v-for="(col, $jndex) in columns" :key="$jndex">{{ row[col.key] }}</td>
                </tr>
            </tbody>
            <tbody v-else class="nrdb-table-nodata">
                <tr><td :colspan="columns.length">No Data</td></tr>
            </tbody>
        </v-table>
        <v-pagination
            v-if="rows && props.maxrows > 0"
            v-model="pagination.page"
            :length="pagination.pages"
            rounded="0"
        />
    </div>
</template>

<script>

import { useDataTracker } from '../data-tracker.js' // eslint-disable-line import/order
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
                        return { key: col, label: col }
                    })
                } else {
                    return [{
                        key: '', label: ''
                    }]
                }
            } else if (this.props.columns) {
                return this.props.columns
            } else {
                // even if auto cols is off, but we have no columns defined, still have a fall back
                return [{
                    key: '', label: ''
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
            console.log('calculatePaginatedRows', this.pagination.page, this.props.maxrows)
            if (this.props.maxrows > 0) {
                this.pagination.pages = Math.ceil(this.rows?.length / this.props.maxrows)
                this.pagination.rows = this.rows?.slice(
                    (this.pagination.page - 1) * this.props.maxrows,
                    (this.pagination.page) * this.props.maxrows
                )
                console.log('updated', this.pagination.pages, this.pagination.rows)
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
.nrdb-table {

}
.nrdb-table-nodata {
    text-align: center;
}
.nrdb-table-nodata td {
    opacity: 0.5;
}
</style>
