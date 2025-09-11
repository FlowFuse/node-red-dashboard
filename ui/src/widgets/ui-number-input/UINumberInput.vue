<template>
    <div ref="container" class="nrdb-ui-number-field">
        <v-tooltip :text="tooltip" :disabled="!tooltip?.length" location="bottom">
            <!-- eslint-disable-next-line vue/no-template-shadow -->
            <template #activator="{ props }">
                <v-number-input
                    v-model="value" :class="{'compressed': isCompressed, 'stacked-spinner': spinner === 'stacked'}" :reverse="false" :controlVariant="spinner" :hideInput="false" :inset="false"
                    v-bind="props" :disabled="!state.enabled"
                    :rules="validation" :clearable="clearable" variant="outlined" hide-details="auto"
                    :prepend-icon="prependIcon" :append-icon="appendIcon" :append-inner-icon="appendInnerIcon" :precision="null"
                    :prepend-inner-icon="prependInnerIcon" :min="min" :max="max" :step="step" @update:model-value="onChange" @keyup.enter="onEnter" @blur="onBlur" @click:clear="onClear"
                >
                    <template #label>
                        <!-- eslint-disable-next-line vue/no-v-html -->
                        <span v-html="label" />
                    </template>
                </v-number-input>
            </template>
        </v-tooltip>
    </div>
</template>

<script>
import DOMPurify from 'dompurify'

import { VNumberInput } from 'vuetify/lib/components/VNumberInput/VNumberInput'
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
            isCompressed: false
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        label () {
            // Sanetize the html to avoid XSS attacks
            return DOMPurify.sanitize(this.getProperty('label'))
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
            return Math.abs(this.getProperty('step')) || 1
        },
        spinner () {
            return this.getProperty('spinner')
        },
        value: {
            get () {
                const val = this.messages[this.id]?.payload
                if (val === null || val === undefined || val === '') {
                    return val
                } else {
                    return Number(val)
                }
            },
            set (val) {
                if (this.value === val) {
                    return // no change
                }
                const msg = this.messages[this.id] || {}
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
        this.$dataTracker(this.id, null, null, this.onDynamicProperties, null)
    },
    methods: {
        send () {
            this.$socket.emit('widget-change', this.id, this.value)
        },
        onChange () {
            this.send()
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
            return 'mdi-' + icon?.replace(/^mdi-/, '')
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
            this.updateDynamicProperty('spinner', updates.spinner)
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

    .v-field__field input {
        padding-inline: var(--v-field-padding-start) 0;
    }

    .v-btn--icon.v-btn--density-default {
        width: calc(var(--v-btn-height) + 0px);
    }

    .stacked-spinner {
        .v-btn--icon.v-btn--density-default {
            width: auto;
            min-height: 0;
        }
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
