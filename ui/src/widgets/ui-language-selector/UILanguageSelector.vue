<template>
    <div>
        <Teleport v-if="widgetType === 'ui' && targetReady" :to="teleportTarget">
            <v-select
                v-model="value"
                :items="options"
                :disabled="!state.enabled"
                :class="className"
                item-title="label"
                item-value="value"
                variant="plain"
                density="compact"
                hide-details="auto"
                style="max-width: 120px"
                @update:model-value="onChange"
            />
        </Teleport>
        <v-select
            v-else
            v-model="value"
            :items="options"
            :label="label"
            :disabled="!state.enabled"
            :class="className"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            @update:model-value="onChange"
        />
    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: 'UILanguageSelector',
    inject: ['$socket'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({ enabled: true }) }
    },
    data () {
        return {
            mounted: false,
            targetReady: false,
            value: this.props.currentLanguage || this.$store.state.i18n?.locale || 'en',
            options: this.props.options || [],
            currentLanguage: this.props.currentLanguage || this.$store.state.i18n?.locale || 'en'
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        ...mapState('i18n', ['locale']),
        label () {
            return this.getTranslatedProperty('label')
        },
        className () {
            return this.props.className || ''
        },
        widgetType () {
            return this.props.widgetType || 'group'
        },
        teleportTarget () {
            return this.props.teleportTarget || '#app-bar-actions'
        }
    },
    watch: {
        locale: {
            immediate: true,
            handler (newLocale) {
                // Update selection when locale changes
                this.value = newLocale
                this.currentLanguage = newLocale
            }
        }
    },
    mounted () {
        this.mounted = true

        // Check for teleport target availability
        if (this.widgetType === 'ui') {
            this.checkTeleportTarget()
        } else {
            // For non-UI widgets, mark as ready immediately
            this.targetReady = true
        }
    },
    created () {
        // Load initial options and current language
        this.$socket.on('widget-load:' + this.id, (data) => {
            if (data.options) {
                this.options = data.options
            }
            if (data.currentLanguage) {
                this.value = data.currentLanguage
                this.currentLanguage = data.currentLanguage
            }
        })

        // Listen for language changes
        this.$socket.on('widget-change:' + this.id, (data) => {
            if (data.currentLanguage) {
                this.value = data.currentLanguage
                this.currentLanguage = data.currentLanguage
            }
        })

        // Handle incoming messages
        this.$socket.on('msg-input:' + this.id, (msg) => {
            // Handle dynamic updates if needed
            if (msg.options) {
                this.options = msg.options
            }
        })
    },
    methods: {
        onChange (value) {
            // Change the application language
            this.$store.commit('i18n/setLocale', value)

            // Find the language object
            const langObj = this.options.find(opt => opt.value === value)

            // Prepare payload based on output format
            let payload = value
            if (this.props.outputFormat === 'object' && langObj) {
                payload = { code: value, name: langObj.label }
            }

            // Emit to server
            const msg = {
                payload,
                topic: this.props.topic || 'language'
            }

            // Add language object for auto mode
            if (this.props.outputFormat === 'auto' && langObj) {
                msg.languageObject = { code: value, name: langObj.label }
            }

            this.$socket.emit('widget-action', this.id, msg)

            // Notify other widgets about language change through store
            // Don't use ui-control as it's meant for navigation
        },
        getTranslatedProperty (prop) {
            // Helper to get translated property
            const propValue = this.props[prop]
            if (!propValue) return ''

            if (typeof propValue === 'object' && !Array.isArray(propValue)) {
                return propValue[this.locale] || propValue.en || Object.values(propValue)[0] || ''
            }

            return propValue
        },
        checkTeleportTarget () {
            const checkInterval = setInterval(() => {
                const target = document.querySelector(this.teleportTarget)
                if (target) {
                    this.targetReady = true
                    clearInterval(checkInterval)
                }
            }, 100)

            // Stop checking after 5 seconds
            setTimeout(() => {
                if (!this.targetReady) {
                    clearInterval(checkInterval)
                }
            }, 5000)
        }
    }
}
</script>

<style scoped>
/* Ensure the language selector is visible in the app bar */
.v-select {
    min-width: 100px;
}

/* Style for UI mode in app bar */
.v-select--variant-plain {
    color: inherit;
}
</style>
