/* eslint-env browser */
/* global RED */
/**
 * JavaScript and CSS editing for the <script> and <style> blocks of a ui-template (`vue-sfc` language).
 *
 * Node-RED provides the machinery (RED.editor.codeEditor.monaco.registerEmbeddedLanguages, in newer
 * Node-RED versions). This module only adds what is specific to Dashboard: the type of `this`. Dashboard runs a
 * ui-template script in one of two ways (ui/src/widgets/ui-template/UITemplate.vue, ui/src/util/vue.acorn.js):
 *  - a script whose only statement is `export default { ... }` is a Vue component; Node-RED's hidden copy
 *    of it becomes `export default __uiTemplate({ ... })`, which types `this` in data, computed, methods,
 *    watch, mounted and unmounted
 *  - any other script runs inside `mounted`, so it is wrapped in a function whose `this` is the component
 * Both see what Dashboard adds to the component: send(), submit(), msg, value, id, props, $socket, ...
 */

const TYPES_PATH = 'file:///node_modules/@types/node-red-dashboard-ui-template/index.d.ts'

/** Type declarations for the ui-template component instance */
export const UI_TEMPLATE_TYPES = `
/** Members that Dashboard adds to every ui-template component */
interface UiTemplateContext {
    /** The ID of this ui-template node, assigned by Node-RED */
    readonly id: string
    /** The configuration of this ui-template node */
    readonly props: { name?: string, templateScope?: string, [key: string]: any }
    /** The last message received by this ui-template node */
    readonly msg: { payload?: any, topic?: string, [key: string]: any }
    /** Get or set \`msg.payload\` of the last message */
    value: any
    /** Send a message to the Node-RED flow. A non-object value is sent as \`msg.payload\`. */
    send(msg: any): void
    /** Send an event to the Node-RED flow, with \`topic\` set to the event type */
    submit(event: Event): void
    /** The socket.io connection to Node-RED */
    readonly $socket: {
        on(event: string, listener: (...args: any[]) => void): any
        off(event: string, listener?: (...args: any[]) => void): any
        emit(event: string, ...args: any[]): any
        [key: string]: any
    }
    /** Last message received by every widget, by widget ID */
    readonly messages: Record<string, any>
    /** Dashboard setup information */
    readonly setup: any
    readonly $dataTracker: any
    /** The Dashboard Vuex store */
    readonly $store: any
    /** The Dashboard router */
    readonly $router: any
    /** The current route */
    readonly $route: any
    /** The Vuetify instance */
    readonly $vuetify: any
    /** The root DOM element of this component */
    readonly $el: any
    /** Elements and components registered with \`ref\` */
    readonly $refs: Record<string, any>
    readonly $data: Record<string, any>
    readonly $parent: any
    readonly $root: any
    readonly $options: Record<string, any>
    /** Trigger a custom event on this component */
    $emit(event: string, ...args: any[]): void
    /** Wait for the next DOM update */
    $nextTick(fn?: () => void): Promise<void>
    /** Watch a reactive property or getter */
    $watch(source: string | (() => any), callback: (value: any, oldValue: any) => void, options?: { immediate?: boolean, deep?: boolean }): () => void
    /** Force this component to re-render */
    $forceUpdate(): void
}
type UiTemplateComputed<C> = { [K in keyof C]: C[K] extends (...args: any[]) => infer R ? R : C[K] extends { get(): infer G } ? G : never }
type UiTemplateInstance<D, C, M> = D & UiTemplateComputed<C> & M & UiTemplateContext
type UiTemplateWatcher = ((value: any, oldValue: any) => void) | { handler: (value: any, oldValue: any) => void, deep?: boolean, immediate?: boolean }
/** The options that a ui-template component supports */
declare function __uiTemplate<D = {}, C = {}, M = {}>(component: {
    name?: string
    data?: (this: UiTemplateContext) => D
    computed?: C & ThisType<UiTemplateInstance<D, C, M>>
    methods?: M & ThisType<UiTemplateInstance<D, C, M>>
    // \`this\` in these comes from the ThisType below; typing it here as well stops TypeScript inferring D, C and M
    watch?: Record<string, UiTemplateWatcher>
    mounted?: () => void
    unmounted?: () => void
    /** Dashboard ignores other options (it logs a warning); allowed here so that one doesn't stop \`this\` being typed */
    [option: string]: any
} & ThisType<UiTemplateInstance<D, C, M>>): void
`

// whitespace and comments, which Dashboard allows around a component (they aren't statements)
const GAP = String.raw`(?:\s|\/\/[^\n]*(?:\n|$)|\/\*(?:[^*]|\*(?!\/))*\*\/)*`

/**
 * Where a ui-template script is a component: Dashboard treats it as one when its only statement is
 * `export default { ... }`.
 * @param {string} body - the script's code
 * @returns {{ open: number, close: number } | null} offsets (in body) of the object's `{` and `}`
 */
export function findComponent (body) {
    const head = new RegExp(`^${GAP}export\\s+default\\s*(?=\\{)`).exec(body)
    const tail = new RegExp(`\\}\\s*;?${GAP}$`).exec(body)
    return head && tail ? { open: head[0].length, close: tail.index } : null
}

/**
 * The `wrap` hook for registerEmbeddedLanguages: text to insert around a script so `this` has its type.
 * @param {string} text - the ui-template
 * @param {{start: number, end: number}} region - the script's code
 * @param {number} index - the script's position in the template
 * @returns {{at: number, text: string}[]} insertions at offsets in the ui-template
 */
export function wrapScript (text, region, index) {
    const component = findComponent(text.slice(region.start, region.end))
    if (component) {
        return [
            { at: region.start + component.open, text: '__uiTemplate(' },
            { at: region.start + component.close + 1, text: ')' }
        ]
    }
    return [
        { at: region.start, text: `/** @this {UiTemplateContext} */ function __uiTemplateScript${index} () {` },
        { at: region.end, text: '\n}' }
    ]
}

/**
 * Registers Dashboard's script and style support with Node-RED's code editor.
 * @param {object} monaco - the monaco namespace (unused, kept for the same signature as vue-sfc.mjs)
 * @param {object} options
 * @param {string} options.languageId - the ui-template language id (vue-sfc)
 * @returns {boolean} false if this Node-RED doesn't provide registerEmbeddedLanguages
 */
export function activate (monaco, { languageId }) {
    const register = RED.editor?.codeEditor?.monaco?.registerEmbeddedLanguages
    if (typeof register !== 'function') {
        return false
    }
    register(languageId, {
        javascript: {
            wrap: wrapScript,
            extraLibs: [{ content: UI_TEMPLATE_TYPES, filePath: TYPES_PATH }],
            hiddenNames: /^__uiTemplate/,
            // list the component's own members before the Vue/Dashboard `$` members
            demotedNames: /^\$/
        },
        css: {}
    })
    return true
}
