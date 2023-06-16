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
            console.log("msg received in " + widgetId)
            console.log(msg.topic, msg.payload)
            store.commit('data/bind', {
                widgetId,
                data: msg.payload
            })
        })
    })
    onUnmounted(() => {
        socket.off("msg-input:" + widgetId)
    })

    return 
}