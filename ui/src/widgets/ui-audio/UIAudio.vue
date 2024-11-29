<template>
    <!-- if you remove the `controls` attribute, you MUST click something on the page before initiating play -->
    <audio
        ref="audio"
        width="100%"
        height="100%"
        controls
        :autoplay="autoplay"
        :loop="loop"
        :muted="muted"
        :src="value"
        @play="handlePlayerEvents"
        @pause="handlePlayerEvents"
        @ended="handlePlayerEvents"
    />
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: 'DBUIAudio',
    inject: ['$socket', '$dataTracker'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    emits: ['mounted'],
    data () {
        return {
            show: false,
            tik: 0,
            countdown: 0,
            timeouts: {
                close: null,
                step: null
            }
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        value: function () {
            // Get the value (i.e. the notification text content) from the last input msg
            const value = this.messages[this.id]?.payload || this.props.src
            return value
        },
        loop () {
            if (this.getProperty('loop') === 'on') {
                return true
            } else {
                return false
            }
        },
        muted () {
            if (this.getProperty('muted') === 'on') {
                return true
            } else {
                return false
            }
        },
        autoplay () {
            if (this.getProperty('autoplay') === 'on') {
                return true
            } else {
                return false
            }
        }
    },
    created () {
        // can't do this in setup as we have custom onInput function
        this.$dataTracker(this.id, this.onMsgInput, null, this.onDynamicProperties)
    },
    mounted () {
        this.$emit('mounted', this)
    },
    methods: {
        onDynamicProperties (msg) {
            const updates = msg.ui_update
            if (!updates) {
                return
            }
            this.updateDynamicProperty('src', updates.src)
            this.updateDynamicProperty('autoplay', updates.autoplay)
            this.updateDynamicProperty('loop', updates.loop)
            this.updateDynamicProperty('muted', updates.muted)
        },
        onMsgInput (msg) {
            // Make sure the last msg (that has a payload, containing the notification content) is being stored
            if (msg.payload) {
                this.$store.commit('data/bind', {
                    widgetId: this.id,
                    msg
                })
            }

            switch (msg.playback) {
            case 'play':
                this.$refs.audio.play()
                break
            case 'stop':
                this.$refs.audio.src = ''
                break
            case 'pause':
                this.$refs.audio.pause()
                break
            }
        },
        handlePlayerEvents (event) {
            const msg = this.messages[this.id] || {}
            msg._event = event.type
            this.$socket.emit('widget-action', this.id, msg)
        }
    }
}
</script>

<style>
.hidden {
    display: none !important;
}
</style>
