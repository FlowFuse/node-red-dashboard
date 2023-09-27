# Adding New Core Widgets

We are always open to Pull Requests and new ideas on widgets that can be added to the core Dashboard repository.

When adding a new widget to the core collection, you will need to follow the steps below to ensure that the widget is available in the Node-RED editor and renders correctly in the UI.

## Checklist

1. In `/nodes/`:
    - Add `<widget>.html`
    - Add `<widget>.js`
    - Add the in the `node-red/nodes` section in `package.json`
2. In `/ui/`:
    - Add `widgets/<widget>/<widget>.vue`
    - Add widget to the `index.js` file in `/ui/widgets`

## Example <widget.vue>

```vue
<template>
    <div @click="onAction">
        {{ id }}
    </div>
</template>

<script>
    import { useDataTracker } from '../data-tracker.js'
    import { mapState } from 'vuex'

    export default {
        name: 'DBUIWidget',
        // we need to inject $socket so that we can send events to Node-RED
        inject: ['$socket'],
        props: {
            id: String,    // the id of the widget, as defined by Node-RED
            props: Object, // the properties for this widget defined in the Node-RED editor
            state: Object  // the state of this widget, e.g. enabled, visible
        },
        computed: {
            // map our data store such that we can get any data bound to this widget
            // received on input from Node-RED
            ...mapState('data', ['messages']), // provides access to `this.messages` where `this.messages[this.id]` is the stored msg for this widget
        },
        setup (props) {
            // Use our data-tracker, which setups up the basic event handling for us
            // including `on('msg-input')` and `on('widget-load')`
            useDataTracker(props.id)
        },
        methods: {
            onAction () {
                // we can send any data we need Node-RED through this (optional) message parameter
                const msg = {
                    payload: 'hello world'
                }
                // send an event to Node-RED to inform it that we've clicked this widget
                this.$socket.emit('widget-action', this.id, msg)
            }
        }
    }
</script>
  
<style scoped>