<template>
    <BaselineLayout :page-title="$route.meta.title">
        <div v-if="orderedGroups" :id="'nrdb-page-' + $route.meta.id" class="nrdb-layout--wysiwyg nrdb-ui-page" :class="page?.className">
            <div
                v-for="(g, $index) in groups"
                :id="'nrdb-ui-group-' + g.id"
                :key="g.id"
                class="nrdb-ui-group"
                :disabled="g.disabled === true ? 'disabled' : null"
                :class="getGroupClass(g)"
                :style="`grid-column-end: span min(${ g.width }, var(--layout-columns)`"
                draggable="true"
                @dragstart="onDragStart($event, $index)"
                @dragover="onDragOver($event, $index)"
                @drop="onDrop($event, $index)"
            >
                <v-card variant="outlined" class="bg-group-background">
                    <template #title>{{ g.name }} {{ g.order }}</template>
                    <template #text>
                        <widget-group :group="g" :widgets="widgetsByGroup(g.id)" />
                    </template>
                </v-card>
            </div>
        </div>
        <!-- <div>
            <component
                :is="widget.component"
                v-for="widget in pageWidgets"
                :id="widget.id"
                :key="widget.id"
                :props="widget.props"
                :state="widget.state"
            />
        </div> -->
        <div class="nrdb-ui-editor-tray-container">
            <div class="nrdb-ui-editor-tray">
                <v-btn variant="outlined" @click="discard">Discard Changes</v-btn>
                <v-btn variant="flat" @click="save">Save Changes</v-btn>
            </div>
        </div>
    </BaselineLayout>
</template>

<script>
import NodeREDAPI from '../api/node-red'

import BaselineLayout from './Baseline.vue'
import WidgetGroup from './Group.vue'

// eslint-disable-next-line import/order, sort-imports
import { mapState, mapGetters } from 'vuex'

export default {
    name: 'LayoutWYSIWYG',
    components: {
        BaselineLayout,
        WidgetGroup
    },
    data () {
        return {
            groups: [],
            dragging: {
                index: -1
            }
        }
    },
    computed: {
        ...mapState('ui', ['pages']),
        ...mapState('data', ['properties']),
        ...mapGetters('ui', ['groupsByPage', 'widgetsByGroup', 'widgetsByPage']),
        orderedGroups: function () {
            // get groups on this page
            const groups = this.groupsByPage(this.$route.meta.id)
                // only show hte groups that haven't had their "visible" property set to false
                .filter((g) => {
                    if ('visible' in g) {
                        return g.visible
                    }
                    return true
                })
                .sort((a, b) => {
                    return a.order - b.order
                })
            return groups
        },
        pageWidgets: function () {
            return this.widgetsByPage(this.$route.meta.id)
        },
        page: function () {
            return this.pages[this.$route.meta.id]
        }
    },
    mounted () {
        // get groups for this page
        this.groups = this.loadGroupsFromStore()
    },
    methods: {
        loadGroupsFromStore () {
            const groups = this.groupsByPage(this.$route.meta.id)
                // only show hte groups that haven't had their "visible" property set to false
                .filter((g) => {
                    if ('visible' in g) {
                        return g.visible
                    }
                    return true
                })
                .sort((a, b) => {
                    return a.order - b.order
                })
            return groups
        },
        save () {
            // API call to NR to trigger a deploy
            NodeREDAPI.deploy()
        },
        discard () {
            // reload groups from store
            this.groups = this.loadGroupsFromStore()
        },
        onDragStart (event, index) {
            this.dragging.index = index
            event.dataTransfer.effectAllowed = 'move'
        },
        onDragOver (event, index) {
            event.preventDefault()
            event.dataTransfer.dropEffect = 'move'
            this.moveGroup(this.dragging.index, index)
        },
        onDrop (event, index) {
            event.preventDefault()
            if (this.dragging.index >= 0) {
                this.moveGroup(this.dragging.index, index)
                this.dragging.index = null
            }
        },
        moveGroup (fromIndex, toIndex) {
            const movedItem = this.groups.splice(fromIndex, 1)[0]
            this.groups.splice(toIndex, 0, movedItem)
            // update .order property of all groups
            this.groups.forEach((group, index) => {
                group.order = index + 1
            })
            this.dragging.index = toIndex
        },
        getWidgetClass (widget) {
            const classes = []
            // ensure each widget has a class for its type
            classes.push(`nrdb-${widget.type}`)
            if (widget.props.className) {
                classes.push(widget.props.className)
            }
            if (widget.state.class) {
                classes.push(widget.state.class)
            }
            return classes.join(' ')
        },
        getGroupClass (group) {
            const classes = []
            // add any class set in the group's properties
            if (group.className) {
                classes.push(group.className)
            }
            // add dynamically set class(es)
            const properties = this.properties[group.id]
            if (properties && properties.class) {
                classes.push(properties.class)
            }

            // dragging interaction classes
            const dragging = this.groups[this.dragging.index]
            if (dragging?.id === group.id) {
                classes.push('dragging')
            }
            return classes.join(' ')
        }
    }
}
</script>

<style scoped>
.nrdb-ui-group.dragging {
    border-style: dashed;
}
.nrdb-ui-editor-tray-container {
    position: absolute;
    bottom: 24px;
    width: 100%;
    display: flex;
    justify-content: center;
}
.nrdb-ui-editor-tray {
    background-color: white;
    border: 1px solid #ccc;
    box-shadow: 0px 0px 5px black;
    padding: 8px;
    border-radius: 4px;
}

/* Actual Layout Styling */
.nrdb-layout--wysiwyg {
    --layout-card-width: 320px;
    --layout-gap: 12px;
    --layout-columns: 12;
    display: grid;
    grid-template-columns: repeat(var(--layout-columns), 1fr);
    flex-wrap: wrap;
    padding: var(--page-padding);
    gap: var(--group-gap);
}

@media only screen and (max-width: 1024px) {
    .nrdb-layout--wysiwyg {
        --layout-columns: 9;
    }
}

@media only screen and (max-width: 768px) {
    .nrdb-layout--wysiwyg {
        --layout-columns: 6;
    }
}

@media only screen and (max-width: 576px) {
    .nrdb-layout--wysiwyg {
        --layout-columns: 3;
    }
}
</style>
