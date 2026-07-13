<template>
    <div class="nrdb-ui-gauge-tile" :class="`nrdb-ui-gauge-tile--icon-${iconPosition}`" :style="{'background-color': segment.color, 'color': segment.textColor}" @click="onClick">
        <v-icon v-if="mdiIcon" class="nrdb-ui-gauge-tile-icon" :icon="mdiIcon" />
        <label v-if="segment.text">{{ segment.text }}</label>
        <span v-if="props.alwaysShowTitle" class="nrdb-ui-gauge-tile-floating-label" :style="floatingPosition">{{ props.label }}</span>
    </div>
</template>

<script>

import UIGaugeMethods from '../ui-gauge.js'

import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUIGaugeTile',
    inject: ['$socket', '$dataTracker'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) },
        value: { type: Number, default: 0 }
    },
    computed: {
        ...mapState('data', ['messages']),
        segment () {
            console.log('DBUIGaugeTile segment', this.props.segments, this.value)
            const segment = UIGaugeMethods.getSegment(this.props.segments, this.value)
            let label = segment?.text || ''
            if (segment.textType === 'none') {
                label = ''
            } else if (segment.textType === 'value') {
                label = (this.value ?? '').toString()
            } else if (segment.textType === 'label') {
                label = (this.props.label || '').toString()
            }
            console.log('DBUIGaugeTile segment label', label, segment)
            return {
                text: label,
                color: segment?.color ?? 'var(--v-theme-primary)',
                textColor: segment?.textColor ?? 'var(--v-theme-on-primary)',
                from: segment?.from ?? 0
            }
        },
        mdiIcon () {
            const icon = this.props.icon
            if (!icon) {
                return ''
            }
            return 'mdi-' + icon.replace(/^mdi-/, '')
        },
        iconPosition () {
            const allowed = ['top', 'bottom', 'left', 'right']
            return allowed.includes(this.props.iconPosition) ? this.props.iconPosition : 'top'
        },
        floatingPosition () {
            const pos = this.props.floatingTitlePosition
            const padding = '12px'
            if (pos === 'top-right') {
                return {
                    top: padding,
                    right: padding
                }
            } else if (pos === 'bottom-left') {
                return {
                    bottom: padding,
                    left: padding
                }
            } else if (pos === 'bottom-right') {
                return {
                    bottom: padding,
                    right: padding
                }
            }
            // default top-left
            return {
                top: padding,
                left: padding
            }
        }
    },
    methods: {
        onClick (evt) {
            const payload = {
                id: this.id,
                value: this.value,
                segment: this.segment
            }
            const msg = this.messages[this.id] || {}
            this.send({
                ...msg,
                payload,
                action: 'click'
            })
        },
        send (msg) {
            this.$socket.emit('widget-send', this.id, msg)
        }
    }
}
</script>

<style scoped lang="scss">
.nrdb-ui-gauge-tile {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2cqmin;
    container-type: size;
    font-weight: bold;
    transition: 0.15s background-color;
    border: 1px solid rgb(var(--v-theme-group-outline));
    label {
        text-align: center;
        font-size: 16px; // fallback for browsers that do not support cqw
        // font-size: 12cqw;
        font-size: min(16cqw, max(40cqmin, .5rem));
        line-height: normal;
    }
}

.nrdb-ui-gauge-tile--icon-top { flex-direction: column; }
.nrdb-ui-gauge-tile--icon-bottom { flex-direction: column-reverse; }
.nrdb-ui-gauge-tile--icon-left { flex-direction: row; }
.nrdb-ui-gauge-tile--icon-right { flex-direction: row-reverse; }

.nrdb-ui-gauge-tile-icon {
    font-size: min(24cqw, max(50cqmin, 1rem)) !important;
    width: auto;
    height: auto;
}

.nrdb-ui-gauge-tile-floating-label {
    position: absolute;
    opacity: 0.6;
    font-size: min(5cqw, max(25cqmin, .4rem));
    line-height: min(5cqw, max(25cqmin, .4rem));
}
</style>
