<template>
    <div
        v-if="offlineReady || needRefresh"
        class="pwa-toast"
        aria-labelledby="toast-message"
        role="alert"
    >
        <div class="message">
            <span id="toast-message">
                {{ title }}
            </span>
        </div>
        <div class="buttons">
            <button v-if="needRefresh" type="button" class="reload" @click="updateServiceWorker">
                Reload
            </button>
            <button type="button" @click="close">
                Close
            </button>
        </div>
    </div>
</template>

<script>

// eslint-disable-next-line import/no-unresolved
import { useRegisterSW } from 'virtual:pwa-register/vue'

export default {
    name: 'PWABadge',
    data () {
        return {
            period: 60 * 60 * 1000, // check for updates every hour
            swActivated: false,
            offlineReady: false,
            needRefresh: false,
            updateServiceWorker: null
        }
    },
    computed: {
        title () {
            if (this.offlineReady) { return 'App is offline ready' }
            if (this.needRefresh) { return 'New content available, click on reload button to update.' }
            return ''
        }
    },
    created () {
        const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
            immediate: true,
            onRegisteredSW: (swUrl, r) => {
                if (this.period <= 0) return
                if (r?.active?.state === 'activated') {
                    this.swActivated = true
                    this.registerPeriodicSync(swUrl, r)
                } else if (r?.installing) {
                    r.installing.addEventListener('statechange', (e) => {
                        const sw = e.target
                        this.swActivated = sw.state === 'activated'
                        if (this.swActivated) { this.registerPeriodicSync(swUrl, r) }
                    })
                }
            }
        })

        this.offlineReady = offlineReady
        this.needRefresh = needRefresh
        this.updateServiceWorker = updateServiceWorker
    },
    methods: {
        registerPeriodicSync (swUrl, r) {
            if (this.period <= 0) return

            setInterval(async () => {
                if ('onLine' in navigator && !navigator.onLine) { return }

                const resp = await fetch(swUrl, {
                    cache: 'no-store',
                    headers: {
                        cache: 'no-store',
                        'cache-control': 'no-cache'
                    }
                })

                if (resp?.status === 200) { await r.update() }
            }, this.period)
        },
        close () {
            this.offlineReady = false
            this.needRefresh = false
        }
    }
}
</script>

<style scoped>
.pwa-toast {
  position: fixed;
  right: 0;
  bottom: 0;
  margin: 16px;
  padding: 12px;
  border: 1px solid #8885;
  background-color: rgb(var(--v-theme-background));
  border-radius: 4px;
  z-index: 1;
  text-align: left;
  box-shadow: 3px 4px 5px 0 #8885;
  display: grid;
}
.pwa-toast .message {
  margin-bottom: 8px;
}
.pwa-toast .buttons {
  display: flex;
}
.pwa-toast button {
  border: 1px solid #8885;
  outline: none;
  margin-right: 5px;
  border-radius: 2px;
  padding: 3px 10px;
}
.pwa-toast button.reload {
  display: block;
}
</style>
