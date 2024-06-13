import { inject, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'

// by convention, composable function names start with "use"
export function useDataTracker (widgetId, onInput, onLoad, onDynamicProperties) {
    if (!widgetId) {
        throw new Error('widgetId is required')
    }

    const store = useStore()
    const socket = inject('$socket')

    function checkDynamicProperties (msg) {
        // set standard dynamic properties states if passed into msg
        if ('enabled' in msg) {
            store.commit('ui/widgetState', {
                widgetId,
                enabled: msg.enabled
            })
        }

        if ('visible' in msg) {
            store.commit('ui/widgetState', {
                widgetId,
                visible: msg.visible
            })
        }

        if ('class' in msg || ('ui_update' in msg && 'class' in msg.ui_update)) {
            const cls = msg.class || msg.ui_update?.class
            store.commit('ui/widgetState', {
                widgetId,
                class: cls
            })
        }

        if (onDynamicProperties) {
            onDynamicProperties(msg)
        }
    }

    // a composable can also hook into its owner component's
    // lifecycle to setup and teardown side effects.
    onMounted(() => {
        if (socket && widgetId) {
            socket.on('widget-load:' + widgetId, (msg) => {
                if (onLoad) {
                    onLoad(msg)
                } else {
                    if (msg) {
                        store.commit('data/bind', {
                            widgetId,
                            msg
                        })
                    }
                }
            })
            // This will on in msg input for ALL components
            socket.on('msg-input:' + widgetId, (msg) => {
                // check for dynamic properties
                checkDynamicProperties(msg)

                if (onInput) {
                    // sometimes we need to have different behaviour
                    onInput(msg)
                } else {
                    // but most of the time, we just care about the value of msg
                    store.commit('data/bind', {
                        widgetId,
                        msg // TODO: we should sanitise what is stored in the store?
                        // One way to do this is to permit only keys explicitly listed in the widget's config (default to topic+payload if none are specified)
                        // A smarter? way to do this is to scan the template for msg.? binds and store only those keys
                        // For now, we'll just store the whole msg
                    })
                }
            })
            // let Node-RED know that this widget has loaded
            // useful as Node-RED can return (via msg-input) any stored data
            socket.emit('widget-load', widgetId)
        }
    })
    onUnmounted(() => {
        socket?.off('msg-input:' + widgetId)
        socket?.off('widget-load:' + widgetId)
    })
}
