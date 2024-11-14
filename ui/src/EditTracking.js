import { computed, reactive } from 'vue'

// A simple non-vuex state store for edit tracking
const state = reactive({
    editKey: '',
    editPage: '',
    editMode: false,
    editorPath: '', // the custom httpAdminRoot path for the NR editor
    isTrackingEdits: false,
    originalGroups: [],
    originalWidgets: []
})

// Methods

/**
 * Initialise the edit tracking state
 * @param {String} editKey - The edit key provided by the server
 * @param {String} editPage - The page id to edit (provided by the server)
 */
function initialise (editKey, editPage, editorPath) {
    state.editKey = editKey
    state.editPage = editPage
    state.editMode = !!editKey && !!editPage
    state.editorPath = editorPath || ''
}

/**
 * Start tracking edits
 */
function startEditTracking (groups, widgets) {
    state.isTrackingEdits = true
    updateEditTracking(groups, widgets)
}

/**
 * Stop tracking edits, clear editKey/editPage & exit edit mode
 */
function exitEditMode () {
    state.editKey = ''
    state.editPage = ''
    state.editMode = false
    state.isTrackingEdits = false
    state.initialised = false
    state.originalGroups = []
    state.originalWidgets = []
}

/**
 * Update the original groups with the current groups
 */
function updateEditTracking (groups, widgets) {
    if (typeof groups !== 'undefined') {
        state.originalGroups = JSON.parse(JSON.stringify(groups))
    }
    if (typeof widgets !== 'undefined') {
        // only store the id, props and layout of each widget (that's all we need for comparison)
        const groupIds = Object.keys(widgets)
        const partials = {}
        for (let i = 0; i < groupIds.length; i++) {
            const groupId = groupIds[i]
            const groupWidgets = widgets[groupId]
            const partialWidgets = groupWidgets.map((w) => {
                return {
                    id: w.id,
                    props: w.props,
                    layout: w.layout
                }
            })
            partials[groupId] = partialWidgets
        }
        state.originalWidgets = JSON.parse(JSON.stringify(partials))
    }
}

// RO computed props
const editKey = computed(() => state.editKey)
const editPage = computed(() => state.editPage)
const editMode = computed(() => !!state.editKey && !!state.editPage)
const editorPath = computed(() => state.editorPath)
const originalGroups = computed(() => state.originalGroups)
const originalWidgets = computed(() => state.originalWidgets)
const isTrackingEdits = computed(() => state.isTrackingEdits)

const groupPropertiesToCheck = [
    (original, current) => +original.width === +current.width,
    (original, current) => +original.height === +current.height,
    (original, current) => +original.order === +current.order
]

const widgetPropertiesToCheck = [
    (original, current) => +original.layout?.width === +current.layout?.width,
    (original, current) => +original.layout?.height === +current.layout?.height,
    (original, current) => +original.layout?.order === +current.layout?.order,
    (original, current) => +original.props?.width === +current.props?.width,
    (original, current) => +original.props?.height === +current.props?.height,
    (original, current) => +original.props?.order === +current.props?.order
]

function isDirty (groups, widgets) {
    console.log('isDirty', groups, widgets)
    const originalGroups = state.originalGroups || []
    // scan through each group and revert changes

    for (let i = 0; i < originalGroups.length; i++) {
        const originalGroup = originalGroups[i]
        const currentGroup = groups?.find(group => group.id === originalGroup.id)
        if (!currentGroup) {
            console.warn('Group not found in pageGroups - as we do not currently support adding/removing groups, this should not happen!')
            return true
        }
        // test group properties
        if (groupPropertiesToCheck.some(check => !check(originalGroup, currentGroup))) {
            return true
        }

        // test widgets belonging to this group
        const originalWidgetValues = state.originalWidgets?.[originalGroup.id] || []
        const currentWidgets = widgets?.[originalGroup.id] || []
        for (let j = 0; j < originalWidgetValues.length; j++) {
            const originalWidget = originalWidgetValues[j]
            const currentWidget = currentWidgets.find(widget => widget.id === originalWidget.id)
            if (!currentWidget) {
                console.warn('Widget not found in pageWidgets - as we do not currently support adding/removing widgets, this should not happen!')
                return true
            }
            if (widgetPropertiesToCheck.some(check => !check(originalWidget, currentWidget))) {
                return true
            }
        }
    }
    return false
}

export { editKey, editMode, editPage, editorPath, originalGroups, originalWidgets, isDirty, isTrackingEdits, initialise, exitEditMode, startEditTracking, updateEditTracking }
