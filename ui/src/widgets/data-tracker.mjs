import { inject, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'

// by convention, composable function names start with "use"
export function useDataTracker (widgetId, onInput, onLoad, onDynamicProperties) {
    if (!widgetId) {
        throw new Error('widgetId is required')
    }

    const store = useStore()
    /** @type {import('socket.io-client').Socket} */
    const socket = inject('$socket')
    let emitWidgetLoadOnConnect = false

    function checkDynamicProperties (msg) {
        // set standard dynamic properties states if passed into msg
        if ('enabled' in msg) {
            store.commit('ui/widgetState', {
                widgetId,
                config: {
                    enabled: msg.enabled
                }
            })
        }

        if ('visible' in msg) {
            store.commit('ui/widgetState', {
                widgetId,
                config: {
                    visible: msg.visible
                }
            })
        }

        if ('class' in msg || ('ui_update' in msg && 'class' in msg.ui_update)) {
            const cls = msg.class || msg.ui_update?.class
            store.commit('ui/widgetState', {
                widgetId,
                config: {
                    class: cls
                }
            })
        }

        if (onDynamicProperties) {
            onDynamicProperties(msg)
        }
    }

    function onWidgetLoad (msg, state) {
        // automatic handle state/dynamic  updates for ALL widgets
        if (state) {
            store.commit('ui/widgetState', {
                widgetId,
                config: state
            })
        }
        // then see if there is custom onLoad functionality to deal with the latest data payloads
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
    }

    function onMsgInput (msg) {
        // check for common dynamic properties cross all widget types
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
    }

    function onDisconnect () {
        // To get a disconnect, we must have previously been connected.
        // Set flag to inform onConnect to emit widget-load
        emitWidgetLoadOnConnect = true
    }

    function onConnect () {
        if (emitWidgetLoadOnConnect) {
            emitWidgetLoadOnConnect = false
            socket.emit('widget-load', widgetId)
        }
    }

    function removeAllListeners () {
        emitWidgetLoadOnConnect = false
        socket?.off('disconnect', onDisconnect)
        socket?.off('msg-input:' + widgetId, onMsgInput)
        socket?.off('widget-load:' + widgetId, onWidgetLoad)
        socket?.off('connect', onConnect)
    }

    // a composable can also hook into its owner component's
    // lifecycle to setup and tear-down side effects.
    onMounted(() => {
        if (socket && widgetId) {
            removeAllListeners()

            socket.on('disconnect', onDisconnect)
            socket.on('msg-input:' + widgetId, onMsgInput)
            socket.on('widget-load:' + widgetId, onWidgetLoad)
            socket.on('connect', onConnect)

            // let Node-RED know that this widget has loaded
            // useful as Node-RED can return (via msg-input) any stored data
            socket.emit('widget-load', widgetId)
        }
    })
    onUnmounted(() => {
        removeAllListeners()
    })
}
