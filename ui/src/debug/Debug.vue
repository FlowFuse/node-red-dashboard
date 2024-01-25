<template>
    <div class="nrdb-debug-view">
        <h1>Dashboard Debug View <v-btn variant="outlined" prepend-icon="mdi-refresh" @click="refresh()">Refresh</v-btn></h1>
        <div class="nrdb-debug-description">
            <p>Data does not automatically update for each item (as event listeners are managed within the rendered components), you will need to manually "refresh" to see updated data.</p>
            <p>This will reconnect the socket connection, where this UI will receive the latest <code>ui-config</code> message.</p>
        </div>
        <v-tabs
            v-model="view.tab"
        >
            <v-tab :value="'dashboards'">Dashboards</v-tab>
            <v-tab :value="'themes'">Themes</v-tab>
            <v-tab :value="'pages'">Pages</v-tab>
            <v-tab :value="'groups'">Groups</v-tab>
            <v-tab :value="'widgets'">Widgets</v-tab>
        </v-tabs>
        <v-window v-model="view.tab">
            <v-window-item value="dashboards">
                <v-data-table :headers="headers.dashboards" :items="items.dashboards" :items-per-page="-1">
                    <template #item.filter.pages="{ item }">
                        <v-btn variant="outlined" @click="applyFilter('pages', 'ui', item.id)">Show Pages</v-btn>
                    </template>
                    <template #bottom />
                </v-data-table>
            </v-window-item>
            <v-window-item value="themes">
                <v-data-table :headers="headers.themes" :items="items.themes" :items-per-page="-1" />
            </v-window-item>
            <v-window-item value="pages">
                <div v-if="filters.pages && filters.pages.length > 0" class="debug-filters">
                    <label>Filters:</label>
                    <div class="debug-filters-chips">
                        <v-chip v-for="(filter, $index) in filters.pages" :key="filter.key" closable @click:close="clearFilter('pages', $index)">{{ filter.key }}: {{ filter.value }}</v-chip>
                    </div>
                </div>
                <v-data-table :headers="headers.pages" :items="items.pages" show-expand :items-per-page="-1">
                    <template #item.filter.groups="{ item }">
                        <v-btn variant="outlined" @click="applyFilter('groups', 'page', item.id)">Show Groups</v-btn>
                    </template>
                    <template #expanded-row="{ columns, item }">
                        <tr>
                            <td :colspan="columns.length" class="nested-table">
                                <v-tabs
                                    v-model="view.nested"
                                >
                                    <v-tab :value="'properties'">Properties</v-tab>
                                    <v-tab :value="'statestore'">Dynamic Properties</v-tab>
                                </v-tabs>
                                <v-window v-model="view.nested">
                                    <v-window-item value="properties">
                                        <v-data-table color="white" :items="Object.entries(item).map(function(e){ return { 'property': e[0], 'value': e[1], 'type': typeof(e[1]) }})" :items-per-page="-1">
                                            <template #bottom />
                                        </v-data-table>
                                    </v-window-item>
                                    <v-window-item value="statestore">
                                        <debug-data type="page" :item="item.id" store="state" />
                                    </v-window-item>
                                </v-window>
                            </td>
                        </tr>
                    </template>
                </v-data-table>
            </v-window-item>
            <v-window-item value="groups">
                <div v-if="filters.groups && filters.groups.length > 0" class="debug-filters">
                    <label>Filters:</label>
                    <div class="debug-filters-chips">
                        <v-chip v-for="(filter, $index) in filters.groups" :key="filter.key" closable @click:close="clearFilter('groups', $index)">{{ filter.key }}: {{ filter.value }}</v-chip>
                    </div>
                </div>
                <v-text-field
                    v-model="search.groups"
                    label="Search"
                    prepend-inner-icon="mdi-magnify"
                    single-line
                    variant="outlined"
                    hide-details
                />
                <v-data-table :headers="headers.groups" :items="items.groups" :items-per-page="-1" show-expand :search="search.groups">
                    <template #item.size="{ item }">
                        <span>{{ item.width }}x{{ item.height || 'auto' }}</span>
                    </template>
                    <template #item.filter.widgets="{ item }">
                        <v-btn variant="outlined" @click="applyFilter('widgets', 'props.group', item.id)">Show Widgets</v-btn>
                    </template>
                    <template #expanded-row="{ columns, item }">
                        <tr>
                            <td :colspan="columns.length" class="nested-table">
                                <v-tabs
                                    v-model="view.nested"
                                >
                                    <v-tab :value="'properties'">Properties</v-tab>
                                    <v-tab :value="'statestore'">Dynamic Properties</v-tab>
                                </v-tabs>
                                <v-window v-model="view.nested">
                                    <v-window-item value="properties">
                                        <v-data-table color="white" :items="Object.entries(item).map(function(e){ return { 'property': e[0], 'value': e[1] }})" :items-per-page="-1">
                                            <template #bottom />
                                        </v-data-table>
                                    </v-window-item>
                                    <v-window-item value="statestore">
                                        <debug-data :item="item.id" store="state" />
                                    </v-window-item>
                                </v-window>
                            </td>
                        </tr>
                    </template>
                </v-data-table>
            </v-window-item>
            <v-window-item value="widgets">
                <div v-if="filters.widgets && filters.widgets.length > 0" class="debug-filters">
                    <label>Filters:</label>
                    <div class="debug-filters-chips">
                        <v-chip v-for="(filter, $index) in filters.widgets" :key="filter.key" closable @click:close="clearFilter('widgets', $index)">{{ filter.key }}: {{ filter.value }}</v-chip>
                    </div>
                </div>
                <v-text-field
                    v-model="search.widgets"
                    label="Search"
                    prepend-inner-icon="mdi-magnify"
                    single-line
                    variant="outlined"
                    hide-details
                />
                <v-data-table :headers="headers.widgets" :items="items.widgets" :items-per-page="-1" show-expand :search="search.widgets">
                    <template #item.size="{ item }">
                        <span>{{ item.props.width || 'auto ' }}x{{ item.props.height || ' auto' }}</span>
                    </template>
                    <template #expanded-row="{ columns, item }">
                        <tr>
                            <td :colspan="columns.length" class="nested-table">
                                <v-tabs
                                    v-model="view.nested"
                                >
                                    <v-tab :value="'properties'">Properties</v-tab>
                                    <v-tab :value="'datastore'">Message History</v-tab>
                                    <v-tab :value="'statestore'">Dynamic Properties</v-tab>
                                </v-tabs>
                                <v-window v-model="view.nested">
                                    <v-window-item value="properties">
                                        <v-data-table color="white" :items="Object.entries(item.props).map(function(e){ return { 'property': e[0], 'value': e[1] }})" :items-per-page="-1">
                                            <template #bottom />
                                        </v-data-table>
                                    </v-window-item>
                                    <v-window-item value="datastore">
                                        <debug-data :item="item.id" store="data" />
                                    </v-window-item>
                                    <v-window-item value="statestore">
                                        <debug-data :item="item.id" store="state" />
                                    </v-window-item>
                                </v-window>
                            </td>
                        </tr>
                    </template>
                </v-data-table>
            </v-window-item>
        </v-window>
    </div>
</template>

<script>
import { mapState } from 'vuex'

import DebugData from './DebugData.vue'

function getProperty (value, property) {
    const props = property.split('.')
    props.forEach((prop) => {
        if (value) {
            value = value[prop]
        }
    })
    return value
}

export default {
    name: 'DebugView',
    components: {
        'debug-data': DebugData
    },
    inject: ['$socket'],
    data () {
        return {
            view: {
                tab: '',
                nested: 'properties'
            },
            filters: {
                pages: [],
                groups: [],
                widgets: []
            },
            search: {
                groups: '',
                widgets: ''
            },
            messages: []
        }
    },
    computed: {
        ...mapState('ui', ['dashboards', 'pages', 'themes', 'groups', 'widgets']),
        ...mapState('data', ['messages']),
        items: function () {
            return {
                dashboards: Object.values(this.dashboards),
                pages: Object.values(this.pages).filter((page) => {
                    return this.filters.pages.every((filter) => {
                        return getProperty(page, filter.key) === filter.value
                    })
                }),
                themes: Object.values(this.themes),
                groups: Object.values(this.groups).filter((group) => {
                    return this.filters.groups.every((filter) => {
                        return getProperty(group, filter.key) === filter.value
                    })
                }),
                widgets: Object.values(this.widgets).filter((widget) => {
                    return this.filters.widgets.every((filter) => {
                        return getProperty(widget, filter.key) === filter.value
                    })
                })
            }
        },
        headers: function () {
            return {
                dashboards: [
                    { title: 'ID', value: 'id' },
                    { title: 'Name', value: 'name' },
                    { title: 'Path', value: 'path' },
                    { title: '', value: 'filter.pages', align: 'end' }
                ],
                themes: [
                    { title: 'ID', value: 'id' },
                    { title: 'Name', value: 'name' },
                    { title: 'Colors', value: 'colors' },
                    { title: 'Sizes', value: 'sizes' }
                ],
                pages: [
                    { title: 'ID', value: 'id' },
                    { title: 'Name', value: 'name' },
                    { title: 'Path', value: 'path' },
                    { title: 'Layout', value: 'layout' },
                    { title: '', value: 'filter.groups', align: 'end' }
                ],
                groups: [
                    { title: 'ID', value: 'id' },
                    { title: 'Name', value: 'name' },
                    { title: 'Size', value: 'size' },
                    { title: '', value: 'filter.widgets', align: 'end' }
                ],
                widgets: [
                    { title: 'ID', value: 'id' },
                    { title: 'Name', value: 'props.name' },
                    { title: 'Label', value: 'props.label' },
                    { title: 'Type', value: 'type' },
                    { title: 'Size', value: 'size' }
                ]
            }
        }
    },
    methods: {
        applyFilter (dataset, key, value) {
            this.filters[dataset].push({ key, value })
            this.view.tab = dataset
        },
        clearFilter (dataset, index) {
            this.filters[dataset].splice(index, 1)
        },
        refresh () {
            // disconnect from the socket connection
            this.$socket.disconnect()
            // re-establish connection, which will trigger the resending of ui-config
            this.$socket.connect()
        }
    }
}
</script>

<style>
.nrdb-debug-view {
    margin: 12px;
    max-width: 1200px;
}
.nrdb-debug-view h1 {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}
.nrdb-debug-description {
    font-size: 0.85rem;
    padding: 16px;
}
.debug-filters {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    margin: 16px;
}
.debug-filters label {
    margin-right: 1rem;
}
.debug-filters-chips {
    display: flex;
    gap: 8px;
    align-items: center;
}
.nested-table,
.nested-table .v-table {
    background-color: #eee;
}
</style>
