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
import DOMPurify from 'dompurify'
import { mapState } from 'vuex'

export default {
    name: 'DBUINotification',
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
            closeAt: null, // epoch ms at which the countdown elapses
            deferCloseWhileHidden: false, // inline alerts only: do not start a leave transition while the tab is hidden
            closePending: false, // countdown elapsed while the tab was hidden; close once visible
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
            const value = this.messages[this.id]?.payload

            // Sanetize the html to avoid XSS attacks.
            // Allow 'style' tags to allow styling of the notification content.
            // The FORCE_BODY is required to avoid 'style' tags (at the start of the value string) still being skipped.
            const sanetizedValue = DOMPurify.sanitize(value, { ADD_TAGS: ['style'], FORCE_BODY: true })
            return sanetizedValue
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
    mounted () {
        document.addEventListener('visibilitychange', this.onVisibilityChange)
        this.$emit('mounted', this)
    },
    beforeUnmount () {
        document.removeEventListener('visibilitychange', this.onVisibilityChange)
        clearTimeout(this.timeouts.close)
        clearInterval(this.timeouts.step)
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
            if (msg.payload) {
                this.$store.commit('data/bind', {
                    widgetId: this.id,
                    msg
                })
            }

            if (msg.show === true || typeof msg.payload !== 'undefined') {
                // If msg.show is true or msg.payload contains a notification title, the notification popup need to be showed (if currently hidden)
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
        /**
         * Show the notification with new content, or replace the content of an already visible
         * notification, and (re)start the auto-close countdown. Used for the Dashboard's own inline
         * alerts (connection lost / re-established), where each alert replaces the previous one.
         */
        showAlert (msg) {
            if (msg.payload) {
                this.$store.commit('data/bind', {
                    widgetId: this.id,
                    msg
                })
            }
            this.show = true
            this.stopCountdown()
            if (this.displayTime > 0) {
                this.startCountdown(this.displayTime * 1000, { deferCloseWhileHidden: true })
            }
        },
        startCountdown (time, { deferCloseWhileHidden = false } = {}) {
            this.tik = (new Date()).getTime()
            this.closeAt = this.tik + time
            this.deferCloseWhileHidden = deferCloseWhileHidden
            this.closePending = false

            this.timeouts.close = setTimeout(() => {
                // close the notification after time has elapsed
                this.onCountdownElapsed()
            }, time)

            // update the progress bar every 100ms
            this.timeouts.step = setInterval(() => {
                const tok = (new Date()).getTime()
                // 100 = full bar, 0 = empty bar (computed from the deadline so a throttled interval stays accurate)
                this.countdown = Math.max(0, ((this.closeAt - tok) / time) * 100)
            }, 100)
        },
        stopCountdown () {
            clearTimeout(this.timeouts.close)
            clearInterval(this.timeouts.step)
            this.tik = null
            this.closeAt = null
            this.deferCloseWhileHidden = false
            this.closePending = false
            this.timeouts.close = null
            this.timeouts.step = null
        },
        onCountdownElapsed () {
            if (this.deferCloseWhileHidden && typeof document !== 'undefined' && document.visibilityState === 'hidden') {
                // Browsers pause animation frames in hidden tabs, so a leave transition started now may
                // never finish and the notification would stay on screen. Defer until the tab is visible.
                // (Inline connection alerts only - flow-driven notifications keep their output timing.)
                this.closePending = true
                this.countdown = 0
                clearInterval(this.timeouts.step)
                this.timeouts.step = null
                return
            }
            this.close('timeout')
        },
        onVisibilityChange () {
            // inline connection alerts only - a flow-driven notification keeps whatever timing its own
            // (possibly throttled) timer gives it, so its output msg is not brought forward
            if (!this.deferCloseWhileHidden || document.visibilityState !== 'visible' || !this.show) {
                return
            }
            // the countdown elapsed while hidden, or the (throttled) timer has not fired yet but is overdue
            if (this.closePending || (this.closeAt !== null && Date.now() >= this.closeAt)) {
                this.close('timeout')
            }
        },
        close (payload) {
            this.show = false

            const msg = this.messages[this.id] || {}
            this.$socket.emit('widget-action', this.id, {
                ...msg,
                payload
            })

            this.stopCountdown()
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
    min-width: auto;
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
