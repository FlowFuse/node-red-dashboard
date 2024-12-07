import { computed, reactive } from 'vue'

// A simple non-vuex state store for edit tracking
const state = reactive({
    editKey: '',
    editPage: '',
    editMode: false,
    editorPath: '', // the custom httpAdminRoot path for the NR editor
    isTrackingEdits: false
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
function startEditTracking () {
    state.isTrackingEdits = true
}

/**
 * Stop tracking edits, clear editKey/editPage & exit edit mode
 */
function endEditMode () {
    state.editKey = ''
    state.editPage = ''
    state.editMode = false
    state.isTrackingEdits = false
    state.initialised = false
}

// RO computed props
const editKey = computed(() => state.editKey)
const editPage = computed(() => state.editPage)
const editMode = computed(() => !!state.editKey && !!state.editPage)
const editorPath = computed(() => state.editorPath)
const isTrackingEdits = computed(() => state.isTrackingEdits)

export { editKey, editMode, editPage, editorPath, isTrackingEdits, initialise, startEditTracking, endEditMode }
