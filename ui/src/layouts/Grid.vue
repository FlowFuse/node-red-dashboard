<template>
    <BaselineLayout :page-title="$route.meta.title">
        <div v-if="orderedGroups" :id="'nrdb-page-' + $route.meta.id" class="nrdb-layout--grid nrdb-ui-page" :class="page?.className">
            <div
                v-for="(g, $index) in orderedGroups"
                :id="'nrdb-ui-group-' + g.id"
                :key="g.id"
                class="nrdb-ui-group"
                :disabled="g.disabled === true ? 'disabled' : null"
                :class="getGroupClass(g)"
                :style="`grid-column-end: span min(${ g.width }, var(--layout-columns)`"
                :draggable="editMode"
                @dragstart="onGroupDragStart($event, $index, g)"
                @dragover="onGroupDragOver($event, $index, g)"
                @dragend="onGroupDragEnd($event, $index, g)"
                @dragleave="onGroupDragLeave($event, $index, g)"
                @drop.prevent
                @dragenter.prevent
            >
                <v-card variant="outlined" class="bg-group-background">
                    <template v-if="g.showTitle" #title>
                        {{ g.name }}
                    </template>
                    <template #text>
                        <widget-group :group="g" :index="$index" :widgets="groupWidgets(g.id)" :resizable="editMode" :group-dragging="groupDragging.active" @resize="onGroupResize" />
                    </template>
                </v-card>
            </div>
            <EditControls v-if="editMode" :dirty="dirty" :saveBusy="saving" @cancel="leaveEditMode" @discard="discardEdits" @save="saveEdits" />
        </div>
        <div>
            <!-- Render any widgets with a 'page' scope -->
            <component
                :is="widget.component"
                v-for="widget in pageWidgets"
                :id="widget.id"
                :key="widget.id"
                :props="widget.props"
                :state="widget.state"
            />
        </div>
        <div v-if="dialogGroups">
            <div
                v-for="g in dialogGroups"
                :id="'nrdb-ui-group-' + g.id"
                :key="g.id"
                class="nrdb-ui-group"
                :disabled="g.disabled === true ? 'disabled' : null"
                :class="getGroupClass(g)"
                :style="`grid-column-end: span min(${ g.width }, var(--layout-columns)`"
            >
                <DialogGroup :group="g">
                    <widget-group :group="g" :widgets="widgetsByGroup(g.id)" />
                </DialogGroup>
            </div>
        </div>
    </BaselineLayout>
    <ConfirmDialog ref="confirmDialog" />
</template>

<script>
import ConfirmDialog from '../components/ConfirmDialog.vue'
import Responsiveness from '../mixins/responsiveness.js'

import BaselineLayout from './Baseline.vue'
import DialogGroup from './DialogGroup.vue'
import WidgetGroup from './Group.vue'
import EditControls from './wysiwyg/EditControls.vue'
import WYSIWYG from './wysiwyg/index.js'

// eslint-disable-next-line import/order, sort-imports
import { mapState, mapGetters } from 'vuex'

export default {
    name: 'LayoutGrid',
    components: {
        BaselineLayout,
        ConfirmDialog,
        DialogGroup,
        EditControls,
        WidgetGroup
    },
    mixins: [Responsiveness, WYSIWYG],
    data () {
        return {
            pageGroups: [],
            saving: false
        }
    },
    computed: {
        ...mapState('ui', ['groups', 'widgets', 'pages', 'edits']),
        ...mapState('data', ['properties']),
        ...mapGetters('ui', ['groupsByPage', 'widgetsByGroup', 'widgetsByPage', 'editedGroups']),
        dialogGroups () {
            const groups = this.groupsByPage(this.$route.meta.id).filter((g) => g.groupType === 'dialog')
            return groups
        },
        pageWidgets: function () {
            return this.widgetsByPage(this.$route.meta.id)
        },
        page: function () {
            return this.pages[this.$route.meta.id]
        },
        orderedGroups: function () {
            if (this.editMode) { // mixin property
                return this.pageGroups
            }
            return this.getPageGroups()
        },
        groupWidgets () {
            if (this.editMode) { // mixin property
                return (groupId) => this.pageGroupWidgets[groupId]
            }
            return (groupId) => this.widgetsByGroup(groupId)
        }
    },
    mounted () {
        console.log('grid layout mounted')
        if (this.editMode) { // mixin property
            this.pageGroups = this.getPageGroups()
            const pageGroupWidgets = {}
            for (const group of this.pageGroups) {
                pageGroupWidgets[group.id] = this.getGroupWidgets(group.id)
            }
            this.pageGroupWidgets = pageGroupWidgets
            this.initializeEditTracking() // Mixin method
        }
    },
    methods: {
        getPageGroups () {
            // get groups on this page
            const groups = this.groupsByPage(this.$route.meta.id)
                // only show hte groups that haven't had their "visible" property set to false
                .filter((g) => {
                    if ('visible' in g) {
                        return g.visible && g.groupType !== 'dialog'
                    }
                    return true
                })
                .sort((a, b) => {
                    return a.order - b.order
                })
            return groups
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
        getGroupWidgets (groupId) {
            // get widgets for this group (sorted by layout.order)
            const widgets = this.widgetsByGroup(groupId)
                // only show the widgets that haven't had their "visible" property set to false
                .filter((g) => {
                    if ('visible' in g) {
                        return g.visible && g.groupType !== 'dialog'
                    }
                    return true
                })
                .sort((a, b) => {
                    return a?.layout?.order - b?.layout?.order
                })
            return widgets
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
            const dragDropClass = this.getGroupDragDropClass(group) // Mixin method
            if (dragDropClass) {
                classes.push(dragDropClass)
            }
            return classes.join(' ')
        },

        // WYSIWYG Edit Control Methods
        async saveEdits () {
            if (!this.dirty) { // Mixin property
                return
            }
            // show a confirmation dialog
            const doSave = await this.$refs.confirmDialog.show({
                title: 'Save Changes',
                icon: 'mdi-content-save-edit-outline',
                message: 'This will deploy your changes to the Node-RED runtime. Are you sure?',
                cancelButton: 'No',
                okButton: 'Yes'
            })
            if (!doSave) { return }
            this.saving = true
            this.deployChanges({
                dashboard: this.page.ui,
                page: this.page.id,
                groups: this.pageGroups,
                widgets: this.pageGroupWidgets
            }).then(() => {
                this.acceptChanges() // Mixin method
            }).catch((error) => {
                console.error('Error saving changes', error)
                this.$refs.confirmDialog.show({
                    title: 'Error saving changes',
                    icon: 'mdi-alert-circle-outline',
                    message: error.message || 'An error occurred while saving your changes.',
                    okButton: 'Close',
                    cancelButton: null
                })
            }).finally(() => {
                this.saving = false
            })
        },
        discardEdits () {
            this.revertEdits() // Mixin method
            this.pageGroups = this.getPageGroups()
        },
        async leaveEditMode () {
            let leave = true
            if (this.dirty) {
                // show a confirmation dialog
                leave = await this.$refs.confirmDialog.show({
                    title: 'Leave Edit Mode',
                    icon: 'mdi-help-circle-outline',
                    message: 'There are unsaved changes that will be discarded if you leave edit mode. Are you sure?',
                    cancelButton: 'No',
                    okButton: 'Yes'
                })
            }
            if (!leave) {
                return
            }
            if (this.dirty) {
                this.discardEdits()
            }
            this.exitEditMode() // Mixin method
        },
        onGroupResize (opts) {
            // ensure opts.width is a number and is greater than 0
            if (typeof opts.width !== 'number' || opts.width < 1) {
                return
            }
            this.pageGroups[opts.index].width = opts.width
        }
    }
}
</script>

<style scoped>

@import "./grid-groups.css";

.nrdb-layout--grid {
    --layout-card-width: 320px;
    --layout-gap: 12px;
}
.nrdb-layout--grid {
    --layout-columns: v-bind(columns);
    display: grid;
    grid-template-columns: repeat(var(--layout-columns), 1fr);
    flex-wrap: wrap;
    padding: var(--page-padding);
    gap: var(--group-gap);
}

.v-card {
    width: 100%;
}

</style>
