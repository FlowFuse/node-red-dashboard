<template>
    <label v-if="props.label" ref="title" class="nrdb-ui-table-title">{{ props.label }}</label>
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
        ref="table"
        v-model="selected"
        class="nrdb-table"
        :mobile="isMobile"
        :class="{'nrdb-table--mobile': isMobile}"
        :items="payload || []" :return-object="true"
        :items-per-page="itemsPerPage"
        :headers="headers" :show-select="props.selectionType === 'checkbox'"
        :search="search"
        @update:model-value="onMultiSelect"
    >
        <template v-if="itemsPerPage === 0" #bottom />
        <template #item="{ item, index, internalItem, isSelected, toggleSelect }">
            <tr
                :class="{'nrdb-table-row-selectable': props.selectionType === 'click', 'nrdb-table-row-selected': selected === item, 'v-data-table__tr--mobile': isMobile}"
                @click="props.selectionType === 'click' ? onRowClick(item) : {}"
            >
                <td v-if="props.selectionType === 'checkbox'" class="v-data-table__td v-data-table-column--no-padding v-data-table-column--align-start">
                    <v-checkbox-btn :modelValue="isSelected(internalItem)" @click="toggleSelect(internalItem)" />
                </td>
                <td v-for="col in headers" :key="col.key" :data-column-key="col.key">
                    <div v-if="isMobile">
                        {{ col.title }}
                    </div>
                    <div class="nrdb-table-cell-align" :style="{'justify-content': isMobile ? 'end' : (col.align || 'start')}">
                        <UITableCell :row="index + 1" :item="item" :property="col.key" :propertyType="col.keyType" :type="col.type" @action-click="onCellClick" />
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
            isMobile: false,
            pagination: {
                page: 1,
                pages: 0,
                rows: []
            },
            localData: []
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        headers () {
            if (this.props.autocols) {
                if (this.localData?.length) {
                    // loop over data and get keys
                    const cols = []
                    for (const row of this.localData) {
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
                    return []
                }
            } else if (this.props.columns) {
                return this.props.columns.map((col) => {
                    return {
                        key: col.key,
                        keyType: col.keyType || 'key',
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
            return this.localData
        },
        itemsPerPage () {
            return this.props.maxrows || 0
        },
        columnTypes () {
            return this.headers.reduce((typeMap, col) => {
                typeMap[col.key] = col.type
                return typeMap
            }, {})
        },
        payload () {
            const value = this.messages[this.id]?.payload
            return this.formatPayload(value) || []
        },
        isAppend () {
            return this.props.action === 'append'
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
        this.$dataTracker(this.id, this.onMsgInput, this.onLoad)
    },
    mounted () {
        this.updateIsMobile()
        window.addEventListener('resize', this.updateIsMobile)
    },
    unmounted () {
        window.removeEventListener('resize', this.updateIsMobile)
    },
    methods: {
        formatPayload (value) {
            if (value !== null && typeof value !== 'undefined') {
                if (typeof value === 'object' && !Array.isArray(value)) {
                    return [value]
                }
            }
            return value
        },
        onMsgInput (msg) {
            const value = this.formatPayload(msg?.payload)
            if (this.props.action === 'append') {
                this.localData = value && value?.length > 0 ? [...this.localData || [], ...value] : value
            } else {
                // Deselect all selected rows when the table is filled with new rows, but only when
                // that behaviour is explicit required (or when not specified for older nodes)
                if (this.props.deselect === true || typeof this.props.deselect === 'undefined') {
                    this.selected = null
                }
                this.localData = value
            }

            this.$store.commit('data/bind', {
                action: this.props.action,
                widgetId: this.id,
                msg: {
                    payload: this.localData
                }
            })
            this.calculatePaginatedRows()
        },
        onLoad (history) {
            this.localData = []
            this.onMsgInput(history)
        },
        calculatePaginatedRows () {
            if (this.itemsPerPage > 0) {
                this.pagination.pages = Math.ceil(this.localData?.length / this.props.maxrows)
                this.pagination.rows = (this.localData || []).slice(
                    (this.pagination.page - 1) * this.props.maxrows,
                    (this.pagination.page) * this.props.maxrows
                )
            } else {
                this.pagination.page = 1
                this.pagination.pages = 0
                this.pagination.rows = this.localData
            }
        },
        onRowClick (row) {
            this.selected = this.selected === row ? null : row

            const msg = {
                payload: row,
                action: 'row_click'
            }
            this.$socket.emit('widget-action', this.id, msg)
        },
        onCellClick (row, columnKey, eventName) {
            // Note that this method currently is only triggered (and relevant) for cell type 'button'
            const msg = {
                payload: row,
                column: columnKey,
                action: eventName
            }
            this.$socket.emit('widget-action', this.id, msg)
        },
        onMultiSelect (selected) {
            const msg = {
                payload: selected,
                action: 'multi_select'
            }
            this.$socket.emit('widget-action', this.id, msg)
        },
        updateIsMobile () {
            this.isMobile = this.checkBreakpoint()
        },
        checkBreakpoint () {
            let table = this.$refs.table
            if (!table) {
                return false
            }
            table = table.$el
            const width = table.clientWidth
            const maxPx = {
                xs: 576,
                md: 768,
                lg: 1024
            }
            if (!this.props.mobileBreakpointType || this.props.mobileBreakpointType === 'none') {
                // no switching to mobile view
                return false
            } else if (this.props.mobileBreakpointType === 'px') {
                return width <= this.props.mobileBreakpoint
            } else if (this.props.mobileBreakpointType === 'defaults') {
                const max = maxPx[this.props.mobileBreakpoint]
                if (max === 0) {
                    // no mobile view
                    return false
                } else {
                    return width <= max
                }
            }
            return true
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

.nrdb-table--mobile {

}
.nrdb-table--mobile td {
    align-items: center;
    column-gap: 4px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    min-height: var(--v-table-row-height);
}

.nrdb-table--mobile .v-data-table__tr--mobile>td:not(:last-child) {
    --mobile-border-opacity: calc(var(--v-border-opacity) * 0.5);
    border-bottom: thin solid rgba(var(--v-border-color), var(--mobile-border-opacity)) !important;
}
.nrdb-ui-table-title {
    display: block;
    text-align: center;
    font-weight: bold;
    font-size: 1rem;
    padding-bottom: 4px;
}
</style>
