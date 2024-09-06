<template>
    <div ref="container" class="nrdb-ui-number-field">
        <v-tooltip :text="tooltip" :disabled="!tooltip?.length" location="bottom">
            <!-- eslint-disable-next-line vue/no-template-shadow -->
            <template #activator="{ props }">
                <v-number-input
                    v-model="value" :class="{'compressed': isCompressed}" :reverse="false" :controlVariant="'stacked'" :hideInput="false" :inset="false"
                    v-bind="props" :disabled="!state.enabled" :label="label"
                    :rules="validation" :clearable="clearable" variant="outlined" hide-details="auto"
                    :prepend-icon="prependIcon" :append-icon="appendIcon" :append-inner-icon="appendInnerIcon"
                    :prepend-inner-icon="prependInnerIcon" :min="min" :max="max" :step="step" @update:model-value="onChange" @keyup.enter="onEnter" @blur="onBlur" @click:clear="onClear"
                />
            </template>
        </v-tooltip>
    </div>
</template>

<script>
// eslint-disable-next-line import/no-unresolved
import { VNumberInput } from 'vuetify/labs/VNumberInput'
import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUITextInput',
    components: {
        VNumberInput
    },
    inject: ['$socket', '$dataTracker'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    data () {
        return {
            delayTimer: null,
            textValue: null,
            previousValue: null,
            isCompressed: false
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        label () {
            return this.getProperty('label')
        },
        tooltip () {
            return this.props.tooltip
        },
        clearable () {
            return this.getProperty('clearable')
        },
        prependIcon () {
            const icon = this.getProperty('icon')
            const mdiIcon = this.makeMdiIcon(icon)
            if (!icon) {
                return undefined
            }
            return icon && this.iconPosition === 'left' && this.iconInnerPosition === 'outside' ? mdiIcon : undefined
        },
        appendIcon () {
            const icon = this.getProperty('icon')
            const mdiIcon = this.makeMdiIcon(icon)
            if (!icon) {
                return undefined
            }
            return icon && this.iconPosition === 'right' && this.iconInnerPosition === 'outside' ? mdiIcon : undefined
        },
        prependInnerIcon () {
            const icon = this.getProperty('icon')
            const mdiIcon = this.makeMdiIcon(icon)
            if (!icon) {
                return undefined
            }
            return icon && this.iconPosition === 'left' && this.iconInnerPosition === 'inside' ? mdiIcon : undefined
        },
        appendInnerIcon () {
            const icon = this.getProperty('icon')
            const mdiIcon = this.makeMdiIcon(icon)
            if (!icon) {
                return undefined
            }
            return icon && this.iconPosition === 'right' && this.iconInnerPosition === 'inside' ? mdiIcon : undefined
        },
        iconPosition () {
            return this.getProperty('iconPosition')
        },
        iconInnerPosition () {
            return this.getProperty('iconInnerPosition')
        },
        min () {
            return this.getProperty('min')
        },
        max () {
            return this.getProperty('max')
        },
        step () {
            return this.getProperty('step')
        },
        value: {
            get () {
                return this.textValue !== null ? Number(this.textValue) : this.textValue
            },
            set (val) {
                if (this.value === val) {
                    return // no change
                }
                const msg = this.messages[this.id] || {}
                this.textValue = val
                msg.payload = val
                this.messages[this.id] = msg
            }
        },
        validation () {
            if (this.type === 'email') {
                return [v => !v || /^[^\s@]+@[^\s@]+$/.test(v) || 'E-mail must be valid']
            } else {
                return []
            }
        },
        rangeAndStep () {
            return {
                min: this.min,
                max: this.max
            }
        }
    },
    watch: {
        rangeAndStep: {
            handler () {
                if (this.value) {
                    if (this.value < this.min) {
                        this.value = this.min
                    } else if (this.value > this.max) {
                        this.value = this.max
                    }
                    this.send()
                    this.previousValue = this.value
                }
            }
        },
        props: {
            handler () {
                this.resize()
            },
            deep: true
        }
    },
    mounted () {
        // on resize handler for window resizing
        window.addEventListener('resize', this.onResize)
        this.onResize()
    },
    unmounted () {
        window.removeEventListener('resize', this.onResize)
    },
    created () {
        // can't do this in setup as we are using custom onInput function that needs access to 'this'
        this.$dataTracker(this.id, this.onInput, this.onLoad, this.onDynamicProperties)
    },
    methods: {
        onInput (msg) {
            // update our vuex store with the value retrieved from Node-RED
            this.$store.commit('data/bind', {
                widgetId: this.id,
                msg
            })
            // make sure our v-model is updated to reflect the value from Node-RED
            if (msg.payload !== undefined) {
                this.textValue = msg.payload
            }
        },
        onLoad (msg) {
            // update vuex store to reflect server-state
            this.$store.commit('data/bind', {
                widgetId: this.id,
                msg
            })
            // make sure we've got the relevant option selected on load of the page
            if (msg?.payload !== undefined) {
                this.textValue = msg.payload
                this.previousValue = msg.payload
            }
        },
        send () {
            this.$socket.emit('widget-change', this.id, this.value)
        },
        onChange () {
            // Since the Vuetify Input Number component doesn't currently support an onClick event,
            // compare the previous value with the current value and check whether the value has been increased or decreased by one.
            if (
                this.previousValue === null ||
                this.previousValue + 1 === this.value ||
                this.previousValue - 1 === this.value
            ) {
                this.send()
            }
            this.previousValue = this.value
        },
        onBlur: function () {
            if (this.props.sendOnBlur) {
                // user has to click away (focus out / blur) they want it submitted
                this.send()
            }
        },
        onEnter: function () {
            if (this.props.sendOnEnter) {
                // user has to press <enter> they want it submitted
                this.send()
            }
        },
        onClear () {
            this.send()
        },
        makeMdiIcon (icon) {
            return 'mdi-' + icon.replace(/^mdi-/, '')
        },
        onDynamicProperties (msg) {
            const updates = msg.ui_update
            if (!updates) {
                return
            }
            this.updateDynamicProperty('label', updates.label)
            this.updateDynamicProperty('clearable', updates.clearable)
            this.updateDynamicProperty('icon', updates.icon)
            this.updateDynamicProperty('iconPosition', updates.iconPosition)
            this.updateDynamicProperty('iconInnerPosition', updates.iconInnerPosition)
            this.updateDynamicProperty('min', updates.min)
            this.updateDynamicProperty('max', updates.max)
            this.updateDynamicProperty('step', updates.step)
        },
        resize () {
            // set isCompressed to true when clearable is true, icon is present and the container is less than 120px
            this.isCompressed = this.$refs.container.clientWidth < 120 && this.clearable && Boolean(this.getProperty('icon'))
        },
        onResize () {
            this.$nextTick(() => {
                this.resize()
            })
        }
    }
}
</script>

<style lang="scss">
.nrdb-ui-number-field {
    .v-field__prepend-inner {
        > .v-icon {
            margin-left: 12px;
        }
    }

    .v-field__append-inner {
        > .v-icon {
            margin-right: 12px;
        }
    }

    button {
        color: var(--red-ui-form-input-border-color);
    }

    .v-field__field {
        position: relative;
        z-index: 2;
        min-width: 50px;
    }

    .v-field__append-inner {
        position: relative;
        z-index: 1;
    }

    .v-btn--icon.v-btn--density-default {
        width: calc(var(--v-btn-height) + 0);
        min-height: 0;
    }

    .compressed {
        .v-field__clearable,
        .v-field__prepend-inner > .v-icon,
        .v-field__append-inner > .v-icon,
        .v-input__prepend > .v-icon,
        .v-input__append > .v-icon{
            display: none;
        }
        .v-field--active input {
            padding-inline: 0.4rem 0.4rem;
        }
    }

    .v-btn--disabled.v-btn--variant-elevated,
    .v-btn--disabled.v-btn--variant-flat {
        background-color: transparent;
        color: var(--red-ui-form-input-border-color);
        opacity: 0.25;
    }
}
</style>
