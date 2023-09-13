<template>
    <v-snackbar
        v-model="show"
        class="nrdb-ui-notification"
        vertical
        multi-line
        :timeout="-1"
        :location="props.position"
    >
        <div v-if="props.showCountdown" class="nrdb-ui-notification-countdown">
            <v-progress-linear v-model="countdown" color="primary" style="display: block; width: 100%" />
        </div>
        <div v-if="!props.raw">{{ value }}</div>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-else v-html="value" />
        <template v-if="props.allowDismiss" #actions>
            <v-btn
                variant="text"
                @click="close"
            >
                {{ props.dismissText || "Close" }}
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script>
import { mapState } from 'vuex'

import { useDataTracker } from '../data-tracker.js' // eslint-disable-line import/order

export default {
    name: 'DBUINotification',
    inject: ['$socket'],
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
        }
    },
    created () {
        // can't do this in setup as we have custom onInput function
        useDataTracker(this.id, this.onMsgInput)
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
                this.close()
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
        close () {
            this.show = false

            clearTimeout(this.timeouts.close)
            clearInterval(this.timeouts.step)
            this.tik = null
            this.timeouts.close = null
            this.timeouts.step = null
        }
    }
}
</script>

<style scoped>
.nrdb-ui-notification {
    padding-top: 64px;
}

.nrdb-ui-notification-countdown {
    position: absolute;
    width: 100%;
    top: 0;
    left: 0;
}
</style>
