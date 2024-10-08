<template>
    <BaselineLayout :page-title="$route.meta.title">
        <div v-if="orderedGroups" :id="'nrdb-page-' + $route.meta.id" class="nrdb-layout--wysiwyg nrdb-ui-page" :class="page?.className">
            <!-- <div
                v-for="(g, $index) in groups"
                :id="'nrdb-ui-group-' + g.id"
                :key="g.id"
                class="nrdb-ui-group"
                :disabled="g.disabled === true ? 'disabled' : null"
                :class="getGroupClass(g)"
                :style="`grid-column-end: span min(${ g.width }, var(--layout-columns)`"
            > -->
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
                @dragend="onDragEnd($event, $index)"
                @dragover="onDragOver($event, $index)"
                @drop="onDrop($event, $index)"
            >
                <v-card variant="outlined" class="bg-group-background">
                    <template #title>{{ g.name }} {{ g.order }} {{ g.width + 'x' + g.height }}</template>
                    <template #text>
                        <widget-group :group="g" :index="$index" :widgets="widgetsByGroup(g.id)" :resizable="true" @resize="onGroupResize" />
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
                <v-tooltip text="Cancel Edit Mode">
                    <template #activator>
                        <v-btn variant="outlined" icon="mdi-close" color="warning" @click="cancel" />
                    </template>
                </v-tooltip>
                <v-tooltip text="Discard Changes">
                    <template #activator>
                        <v-btn :disabled="!hasChanges" variant="outlined" icon="mdi-arrow-u-left-top" @click="discard" />
                    </template>
                </v-tooltip>
                <v-tooltip text="Save Changes">
                    <template #activator>
                        <v-btn :disabled="!hasChanges" variant="flat" icon="mdi-content-save-outline" @click="save" />
                    </template>
                </v-tooltip>
            </div>
        </div>
    </BaselineLayout>
</template>

<script>
import NodeREDAPI from '../api/node-red'

import BaselineLayout from './Baseline.vue'
import WidgetGroup from './Group.vue'

import WYSIWYG from './wysiwyg'

// eslint-disable-next-line import/order, sort-imports
import { mapState, mapGetters } from 'vuex'

export default {
    name: 'LayoutWYSIWYG',
    components: {
        BaselineLayout,
        WidgetGroup
    },
    mixins: [WYSIWYG],
    data () {
        return {
            groups: [],
            dragging: {
                index: -1
            },
            init: {
                groups: []
            }
        }
    },
    computed: {
        ...mapState('ui', ['pages']),
        ...mapState('data', ['properties']),
        ...mapGetters('ui', ['id', 'groupsByPage', 'widgetsByGroup', 'widgetsByPage']),
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
        },
        hasChanges () {
            return JSON.stringify(this.groups) !== JSON.stringify(this.init.groups)
        }
    },
    mounted () {
        // get groups for this page
        this.groups = this.loadGroupsFromStore()

        // clone to track changes
        this.init.groups = JSON.parse(JSON.stringify(this.groups))
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
            NodeREDAPI.deployChanges(this.id, {
                groups: this.groups
            }).then(() => {
                // update saved state
                this.init.groups = JSON.parse(JSON.stringify(this.groups))
            }).catch((error) => {
                console.error('Error saving changes', error)
            })
        },
        discard () {
            // reload groups from store
            this.groups = JSON.parse(JSON.stringify(this.init.groups))
        },
        cancel () {
            console.log('cancel editing placeholder')
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

<style scoped lang="scss">
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
    box-shadow: 0px 0px 5px #00000021;
    padding: 12px;
    border-radius: 4px;
    display: flex;
    gap: 6px;
    border-radius: 2rem;
    .v-btn {
        border-radius: 2rem;
    }
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
