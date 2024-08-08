<template>
    <v-text-field
        v-if="props.showSearch"
        v-model="search"
        label="Search"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        hide-details
        single-line
    />
    <v-data-table
        v-model="selected"
        class="nrdb-table"
        :items="messages[id]?.payload" :return-object="true"
        :items-per-page="itemsPerPage"
        :headers="headers" :show-select="props.selectionType === 'checkbox'"
        :search="search"
        @update:model-value="onMultiSelect"
    >
        <template v-if="itemsPerPage === 0" #bottom />
        <template #item="{ item, index, internalItem, isSelected, toggleSelect }">
            <tr
                :class="{'nrdb-table-row-selectable': props.selectionType === 'click', 'nrdb-table-row-selected': selected === item}"
                @click="props.selectionType === 'click' ? onRowClick(item) : {}"
            >
                <td v-if="props.selectionType === 'checkbox'" class="v-data-table__td v-data-table-column--no-padding v-data-table-column--align-start">
                    <v-checkbox-btn :modelValue="isSelected(internalItem)" @click="toggleSelect(internalItem)" />
                </td>
                <td v-for="col in headers" :key="col.key" :data-column-key="col.key">
                    <div class="nrdb-table-cell-align" :style="{'justify-content': col.align || 'start'}">
                        <UITableCell :table_id="id" :row="index + 1" :item="item" :property="col.key" :type="col.type" @action-click="onCellClick"/>
                    </div>
                </td>
            </tr>
        </template>
    </v-data-table>
</template>

<script>

import UITableCell from './UITableCell.vue'

import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUITable',
    components: {
        UITableCell
    },
    inject: ['$socket', '$dataTracker'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) }
    },
    data () {
        return {
            selected: null,
            search: '',
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
                        title: col.label || col.title,
                        type: col.type,
                        align: col.align,
                        width: col.width
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
        },
        columnTypes () {
            return this.headers.reduce((typeMap, col) => {
                typeMap[col.key] = col.type
                return typeMap
            }, {})
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
    created () {
        this.$dataTracker(this.id)
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
            this.selected = this.selected === row ? null : row

            const msg = {
                payload: row,
                topic: 'row_click'
            }
            this.$socket.emit('widget-action', this.id, msg)
        },
        onCellClick (row, columnKey, topic) {
            // Note that this method currently is only triggered (and relevant) for cell type 'button'
            const msg = {
                payload: row,
                column: columnKey,
                topic: topic
            }
            this.$socket.emit('widget-action', this.id, msg)
        },
        onMultiSelect (selected) {
            const msg = {
                payload: selected,
                topic: 'rows_click'
            }
            this.$socket.emit('widget-action', this.id, msg)
        }
    }
}
</script>

<style>
.nrdb-ui-table {
    overflow-y: auto;
}

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

.nrdb-table-cell-align {
    display: flex;
    align-items: center;
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
    cursor: pointer;
    background-color: rgba(var(--v-theme-on-group-background), var(--v-hover-opacity));
}
.nrdb-table-row-selectable:active {
    background-color: rgba(var(--v-theme-on-group-background), var(--v-selected-opacity));
}
.nrdb-table-row-selected {
    background-color: rgba(var(--v-theme-primary), var(--v-selected-opacity));
}
</style>
