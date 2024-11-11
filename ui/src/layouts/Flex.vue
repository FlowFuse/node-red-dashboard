<template>
    <BaselineLayout :page-title="$route.meta.title">
        <div v-if="orderedGroups" :id="'nrdb-page-' + $route.meta.id" class="nrdb-layout--flex nrdb-ui-page" :class="page?.className">
            <div
                v-for="(g, $index) in orderedGroups"
                :id="'nrdb-ui-group-' + g.id"
                :key="g.id"
                class="nrdb-ui-group"
                :disabled="g.disabled === true ? 'disabled' : null"
                :class="getGroupClass(g)"
                :style="{'width': ((rowHeight * 2 * g.width) + 'px')}"
                :draggable="editMode"
                @dragstart="onDragStart($event, $index)"
                @dragover="onDragOver($event, $index, g)"
                @dragend="onDragEnd($event, $index, g)"
                @dragleave="onDragLeave($event, $index, g)"
                @drop.prevent
                @dragenter.prevent
            >
                <v-card variant="outlined" class="bg-group-background" :style="{'min-height': ((rowHeight * g.height) + 'px')}">
                    <template v-if="g.showTitle" #title>
                        {{ g.name }}
                    </template>
                    <template #text>
                        <widget-group :group="g" :index="$index" :widgets="widgetsByGroup(g.id)" :resizable="editMode" @resize="onGroupResize" />
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
import { mapGetters, mapState } from 'vuex'

import ConfirmDialog from '../components/ConfirmDialog.vue'

import BaselineLayout from './Baseline.vue'
import DialogGroup from './DialogGroup.vue'
import WidgetGroup from './Group.vue'
import EditControls from './wysiwyg/EditControls.vue'
import WYSIWYG from './wysiwyg/index.js'

export default {
    name: 'LayoutFlex',
    components: {
        BaselineLayout,
        ConfirmDialog,
        DialogGroup,
        EditControls,
        WidgetGroup
    },
    mixins: [WYSIWYG],
    data () {
        const rowHeight = getComputedStyle(document.body).getPropertyValue('--widget-row-height')
        return {
            pageGroups: [],
            saving: false,
            rowHeight: parseFloat(rowHeight)
        }
    },
    computed: {
        ...mapState('ui', ['groups', 'widgets', 'pages', 'edits']),
        ...mapState('data', ['properties']),
        ...mapGetters('ui', ['groupsByPage', 'widgetsByGroup', 'widgetsByPage']),
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
        }
    },
    mounted () {
        if (this.editMode) { // mixin property
            this.pageGroups = this.getPageGroups()
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
            const dragDropClass = this.getDragDropClass(group) // Mixin method
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
                groups: this.pageGroups
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
        }
    }
}
</script>

<style scoped>

@import "./grid-groups.css";
.nrdb-layout--flex {
    --layout-card-width: 320px;
    --layout-gap: 12px;
    /* set large number, as the group width will always rule here */
    --layout-columns: 100;
}
.nrdb-layout--flex {
    display: flex;
    flex-wrap: wrap;
    padding: var(--page-padding);
    gap: var(--group-gap);
}

.nrdb-layout--flex > div {
    max-width: 100%;
}

.v-card {
    width: 100%;
}

@media only screen and (max-width: 576px) {
    .nrdb-layout--flex {
        --layout-columns: 3;
    }
}
</style>
