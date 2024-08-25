<template>
    <v-snackbar
        v-model="show"
        class="nrdb-ui-notification"
        vertical
        multi-line
        :timeout="-1"
        :location="position"
        :style="{'--nrdb-ui-notification-color': color}"
    >
        <div v-if="showCountdown" class="nrdb-ui-notification-countdown">
            <v-progress-linear v-model="countdown" :color="progressColor" style="display: block; width: 100%" />
        </div>
        <div v-if="!raw">{{ value }}</div>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-else v-html="value" />
        <template v-if="allowDismiss || allowConfirm" #actions>
            <v-btn
                v-if="allowDismiss"
                variant="text"
                @click="close('dismiss_clicked')"
            >
                {{ dismissText }}
            </v-btn>
            <v-btn
                v-if="allowConfirm"
                variant="text"
                @click="close('confirm_clicked')"
            >
                {{ confirmText }}
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
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
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
            // Get the value (i.e. the notification text content) from the last input msg
            return this.messages[this.id]?.ui_payload || this.messages[this.id]?.payload
        },
        allowConfirm () {
            return this.getProperty('allowConfirm')
        },
        allowDismiss () {
            return this.getProperty('allowDismiss')
        },
        progressColor () {
            return this.messages[this.id]?.color || (this.props.colorDefault ? 'primary' : this.color)
        },
        color () {
            if (this.props.colorDefault) {
                return 'rgb(var(--v-theme-group-background))'
            } else {
                return this.getProperty('color')
            }
        },
        confirmText () {
            return this.getProperty('confirmText')
        },
        dismissText () {
            return this.getProperty('dismissText')
        },
        displayTime () {
            return this.getProperty('displayTime')
        },
        position () {
            return this.getProperty('position')
        },
        raw () {
            return this.getProperty('raw')
        },
        showCountdown () {
            return this.getProperty('showCountdown')
        }
    },
    created () {
        // can't do this in setup as we have custom onInput function
        this.$dataTracker(this.id, this.onMsgInput, null, this.onDynamicProperties)
    },
    methods: {
        onDynamicProperties (msg) {
            const updates = msg.ui_update
            if (!updates) {
                return
            }
            this.updateDynamicProperty('allowConfirm', updates.allowConfirm)
            this.updateDynamicProperty('allowDismiss', updates.allowDismiss)
            this.updateDynamicProperty('color', updates.color)
            this.updateDynamicProperty('confirmText', updates.confirmText)
            this.updateDynamicProperty('dismissText', updates.dismissText)
            this.updateDynamicProperty('displayTime', updates.displayTime)
            this.updateDynamicProperty('position', updates.position)
            this.updateDynamicProperty('raw', updates.raw)
            this.updateDynamicProperty('showCountdown', updates.showCountdown)
        },
        onMsgInput (msg) {
            // Make sure the last msg (that has a payload, containing the notification content) is being stored
            const payload = msg.ui_payload || msg.payload
            if (typeof payload !== 'undefined') {
                this.$store.commit('data/bind', {
                    widgetId: this.id,
                    msg
                })
            }

            if (msg.show === true || typeof payload !== 'undefined') {
                // If msg.show is true or payload contains a notification title, the notification popup need to be showed (if currently hidden)
                if (!this.show) {
                    this.show = true

                    // If a display time has been specified, close the notification automatically after that time
                    if (this.displayTime > 0) {
                        this.startCountdown(this.displayTime * 1000)
                    }
                }
            } else if (msg.show === false) {
                // If msg.show is false, the notification popup need to be hidden (if currently showed)
                if (this.show) {
                    this.close('input_msg')
                }
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
                this.countdown = 100 - (elapsed / parseFloat(this.displayTime)) * 100
            }, 100)
        },
        close (payload) {
            this.show = false

            const msg = this.messages[this.id] || {}
            this.$socket.emit('widget-action', this.id, {
                ...msg,
                payload
            })

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
