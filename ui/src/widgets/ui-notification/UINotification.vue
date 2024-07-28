<template>
    <v-snackbar
        v-model="show"
        class="nrdb-ui-notification"
        vertical
        multi-line
        :timeout="-1"
        :location="props.position"
        :style="{'--nrdb-ui-notification-color': color}"
    >
        <div v-if="props.showCountdown" class="nrdb-ui-notification-countdown">
            <v-progress-linear v-model="countdown" :color="messages[id]?.color || (props.colorDefault ? 'primary' : color)" style="display: block; width: 100%" />
        </div>
        <div v-if="!props.raw">{{ value }}</div>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-else v-html="value" />
        <template v-if="props.allowDismiss" #actions>
            <v-btn
                variant="text"
                @click="close('clicked')"
            >
                {{ props.dismissText || "Close" }}
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: 'DBUINotification',
    inject: ['$socket', '$dataTracker'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) }
    },
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
            return this.messages[this.id]?.payload
        },
        color: function () {
            if (this.messages[this.id]?.color) {
                return this.messages[this.id]?.color
            } else if (this.props.colorDefault) {
                return 'rgb(var(--v-theme-group-background))'
            } else {
                return this.props.color
            }
        }
    },
    created () {
        // can't do this in setup as we have custom onInput function
        this.$dataTracker(this.id, this.onMsgInput)
    },
    methods: {
        onMsgInput (msg) {
            this.$store.commit('data/bind', {
                widgetId: this.id,
                msg
            })
            this.show = true
            if (this.props.displayTime > 0) {
                // begin countdown
                this.startCountdown(this.props.displayTime * 1000)
            }
        },
        startCountdown (time) {
            this.tik = (new Date()).getTime()

            this.timeouts.close = setTimeout(() => {
                // close the notification after time has elapsed
                this.close('timeout')
            }, time)

            // update the progress bar every 100ms
            this.timeouts.step = setInterval(() => {
                const tok = (new Date()).getTime()
                // how many seconds have elapsed
                const elapsed = (tok - this.tik) / 1000
                // 100 = full bar, 0 = empty bar
                this.countdown = 100 - (elapsed / parseFloat(this.props.displayTime)) * 100
            }, 100)
        },
        close (payload) {
            this.show = false
            this.$socket.emit('widget-action', this.id, payload)

            clearTimeout(this.timeouts.close)
            clearInterval(this.timeouts.step)
            this.tik = null
            this.timeouts.close = null
            this.timeouts.step = null
        }
    }
}
</script>

<style>
.nrdb-ui-notification {
    padding-top: 64px;
}

.nrdb-ui-notification .v-snackbar__wrapper {
    background-color: rgb(var(--v-theme-group-background));
    color: rgb(var(--v-theme-on-group-background));
    border-left: 6px solid var(--nrdb-ui-notification-color);
}
.nrdb-ui-notification .v-snackbar__content {
    padding: 8px 12px;
}

.nrdb-ui-notification-countdown {
    position: absolute;
    width: calc(100% + 6px);
    top: 0;
    left: 0;
    margin-left: -6px;
    border-top-left-radius: 4px;
}

.nrdb-ui-notification h1,
.nrdb-ui-notification h2,
.nrdb-ui-notification h3,
.nrdb-ui-notification h4 {
    margin: 0.5rem 0;
}

</style>
