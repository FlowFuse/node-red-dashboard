<template>
    <v-table class="nrdb-table">
        <thead>
            <tr>
                <th v-for="(col, $index) in columns" :key="$index" class="text-left">{{ col.label }}</th>
            </tr>
        </thead>
        <tbody v-if="rows">
            <tr
                v-for="(row, $index) in rows"
                :key="$index"
            >
                <td v-for="(col, $jndex) in columns" :key="$jndex">{{ row[col.key] }}</td>
            </tr>
        </tbody>
        <tbody v-else class="nrdb-table-nodata">
            <tr><td :colspan="columns.length">No Data</td></tr>
        </tbody>
    </v-table>
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
            isValid: null
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        columns () {
            if (this.props.columns) {
                return this.props.columns
            } else if (this.messages[this.id]?.payload) {
                // loop over data and get keys
                const cols = []
                for (const row of this.messages[this.id].payload) {
                    Object.keys(row).forEach((key) => {
                        if (!cols.includes(key)) {
                            cols.push(key)
                        }
                    })
                }
                console.log(cols)
                return cols.map((col) => {
                    return { key: col, label: col }
                })
            } else {
                return [{
                    key: '', label: ''
                }]
            }
        },
        rows () {
            if (this.messages[this.id]?.payload) {
                return this.messages[this.id].payload
            } else {
                return undefined
            }
        }
    },
    mounted () {

    },
    methods: {

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
