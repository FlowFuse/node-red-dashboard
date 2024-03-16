<template>
    <v-data-table
        v-model="selected"
        class="nrdb-table"
        :items="messages[id]?.payload" :return-object="true"
        :items-per-page="itemsPerPage"
        :headers="headers" :show-select="props.selectionType === 'checkbox'"
        @update:model-value="onMultiSelect"
    >
        <template v-if="itemsPerPage === 0" #bottom />
        <template #item="{ index, item, internalItem }">
            <v-data-table-row
                :index="index" :item="internalItem"
                :class="{'nrdb-table-row-selectable': props.selectionType === 'click'}"
                @click="props.selectionType === 'click' ? onRowClick(item) : {}"
            />
        </template>
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
            selected: null,
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
        headers () {
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
                return this.props.columns.map((col) => {
                    return {
                        key: col.key,
                        title: col.label || col.title
                    }
                })
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
        },
        onRowClick (row) {
            console.log(row)
            const msg = {
                payload: row
            }
            this.$socket.emit('widget-action', this.id, msg)
        },
        onMultiSelect (selected) {
            console.log(selected)
            const msg = {
                payload: selected
            }
            this.$socket.emit('widget-action', this.id, msg)
        }
    }
}
</script>

<style>
.nrdb-table.v-table {
    background: rgb(var(--v-theme-group-background));
}

.nrdb-table.v-table, .nrdb-table.v-table .v-table__wrapper > table > thead > tr > th {
    color: rgb(var(--v-theme-on-group-background));
}
.nrdb-table.v-table .v-table__wrapper > table > thead > tr > th {
    font-weight: 600;
}
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

/* .v-data-table__tr--clickable is being assigned wrongly by Vuetify - need to make our own */
.nrdb-table .v-data-table__tr--clickable {
    cursor: default;
}

.nrdb-table-row-selectable:hover {
    background-color: rgba(var(--v-theme-on-group-background), var(--v-hover-opacity));
}
.nrdb-table-row-selectable:active {
    background-color: rgba(var(--v-theme-on-group-background), var(--v-selected-opacity));
}
</style>
