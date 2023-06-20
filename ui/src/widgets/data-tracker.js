import { onMounted, onUnmounted, inject} from 'vue'
import { useStore } from 'vuex'

// by convention, composable function names start with "use"
export function useDataTracker(widgetId) {

    const store = useStore()
    const socket = inject('$socket')

    // a composable can also hook into its owner component's
    // lifecycle to setup and teardown side effects.
    onMounted(() => {
        socket.on("msg-input:" + widgetId, (msg) => {
            console.log("msg-input:" + widgetId, msg)
            store.commit('data/bind', {
                widgetId,
                data: msg.payload
            })
        })
        // let Node-RED know that this widget has loaded
        // useful as Node-RED can return (via msg-input) any stored data 
        socket.emit("widget-load:" + widgetId)
    })
    onUnmounted(() => {
        socket.off("msg-input:" + widgetId)
    })

    return 
}