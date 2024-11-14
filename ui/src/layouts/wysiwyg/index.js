import { editKey, editMode, editPage, editorPath, exitEditMode, isDirty, isTrackingEdits, originalGroups, originalWidgets, startEditTracking, updateEditTracking } from '../../EditTracking.js'
import NodeRedApi from '../../api/node-red'

import DraggableGroupMixin from './draggableGroup.js'
import DraggableWidgetMixin from './draggableWidget.js'
import ResizableMixin from './resizable.js'

export default {
    mixins: [DraggableGroupMixin, DraggableWidgetMixin, ResizableMixin],
    data () {
        return {
            pageGroups: [],
            pageGroupWidgets: []
        }
    },
    computed: {
        dirty () {
            if (!this.editMode || !isTrackingEdits.value) {
                return false
            }
            return isDirty(this.pageGroups, this.pageGroupWidgets)
        },
        editMode: function () {
            return editMode.value && editPage.value === this.$route.meta.id
        }
    },
    methods: {
        initializeEditTracking () {
            if (this.editMode && !isTrackingEdits.value) {
                startEditTracking(this.pageGroups, this.pageGroupWidgets)
            }
        },
        acceptChanges () {
            // TODO: implement widgets
            updateEditTracking(this.pageGroups, this.pageGroupWidgets)
        },
        exitEditMode () {
            const url = new URL(window.location.href)
            url.searchParams.delete('edit-key')
            const query = { ...this.$route.query }
            delete query['edit-key']
            this.$router.replace({ query })
            window.history.replaceState({}, document.title, url)
            exitEditMode() // EditTracking method
        },
        revertEdits () {
            const originalGroupValues = originalGroups.value || []
            // scan through each group and revert changes
            const groupPropertiesOfInterest = ['width', 'height', 'order']
            const widgetLayoutPropertiesOfInterest = ['width', 'height', 'order']
            const widgetPropsPropertiesOfInterest = ['width', 'height', 'order']

            originalGroupValues.forEach((originalGroup, index) => {
                const pageGroup = this.pageGroups?.find(group => group.id === originalGroup.id)
                if (!pageGroup) {
                    console.warn('Group not found in pageGroups - as we do not currently support adding/removing groups, this should not happen!')
                    return
                }
                // restore group properties
                for (const prop of groupPropertiesOfInterest) {
                    if (originalGroup[prop] !== pageGroup[prop]) {
                        pageGroup[prop] = originalGroup[prop]
                    }
                }
                // restore widget properties
                const originalWidgetValues = originalWidgets.value?.[originalGroup.id] || []
                const pageWidgets = this.pageGroupWidgets?.[originalGroup.id] || []
                originalWidgetValues.forEach((originalWidget, index) => {
                    const pageWidget = pageWidgets.find(widget => widget.id === originalWidget.id)
                    const widgetIndex = pageWidgets.indexOf(pageWidget)
                    if (!pageWidget) {
                        console.warn('Widget not found in pageGroupWidgets - as we do not currently support adding/removing widgets, this should not happen!')
                        return
                    }
                    if (widgetIndex !== index) {
                        pageWidgets.splice(widgetIndex, 1)
                        pageWidgets.splice(index, 0, pageWidget)
                    }
                    for (const prop of widgetPropsPropertiesOfInterest) {
                        if (originalWidget.props?.[prop] !== pageWidget.props?.[prop]) {
                            pageWidget.props[prop] = originalWidget.props[prop]
                        }
                    }
                    for (const prop of widgetLayoutPropertiesOfInterest) {
                        if (originalWidget.layout?.[prop] !== pageWidget.layout?.[prop]) {
                            pageWidget.layout[prop] = originalWidget.layout[prop]
                        }
                    }
                })
            })
        },
        deployChanges ({ dashboard, page, groups, widgets }) {
            const normalisedWidgets = {}
            for (const widgetKey in widgets) {
                normalisedWidgets[widgetKey] = widgets[widgetKey].map(widget => {
                    return {
                        id: widget.id,
                        ...widget.props
                    }
                })
            }
            return NodeRedApi.deployChanges({ dashboard, page, groups, widgets: normalisedWidgets, key: editKey.value, editorPath: editorPath.value })
        }
    }
}
