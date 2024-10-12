<template>
    <div class="nrdb-ui-text" :class="'nrdb-ui-text--' + layout" :style="style">
        <label class="nrdb-ui-text-label" v-html="label"></label>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span class="nrdb-ui-text-value" v-html="value" />
    </div>
</template>

<script>
import DOMPurify from 'dompurify'
import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUIText',
    inject: ['$dataTracker'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    computed: {
        ...mapState('data', ['messages', 'properties']),
        value: function () {
            const m = this.messages[this.id] || {}
            if (Object.prototype.hasOwnProperty.call(m, 'payload')) {
                return m.payload
            }
            return ''
        },
        label () {
            // Sanetize the html to avoid XSS attacks
            return DOMPurify.sanitize(this.getProperty('label'))
        },
        layout () {
            return this.getProperty('layout')
        },
        style () {
            if (this.props.style) {
                return {
                    'font-family': this.getProperty('font'),
                    'font-size': `${this.getProperty('fontSize')}px`,
                    color: this.getProperty('color')
                }
            }
            return null
        }
    },
    created () {
        this.$dataTracker(this.id, null, null, this.onDynamicProperties)
    },
    methods: {
        onDynamicProperties (msg) {
            const updates = msg.ui_update
            if (!updates) {
                return
            }
            this.updateDynamicProperty('label', updates.label)
            this.updateDynamicProperty('layout', updates.layout)
            this.updateDynamicProperty('font', updates.font)
            this.updateDynamicProperty('fontSize', updates.fontSize)
            this.updateDynamicProperty('color', updates.color)
        }
    }
}
</script>

<style scoped>
/* Base Styling */
.nrdb-ui-text {
    display: flex;
    flex-direction: row;
    gap: 2px;
    font-size: 1rem;
    font-family: Helvetica;
    flex-wrap: wrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: initial;
}
.nrdb-ui-text-value {
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: initial;
}

/* Layouts */
.nrdb-ui-text--row-left {
    align-items: center;
    justify-content: flex-start;
}
.nrdb-ui-text--row-center {
    align-items: center;
    justify-content: center;
}
.nrdb-ui-text--row-center label,
.nrdb-ui-text--row-center span {
    text-align: center;
}
.nrdb-ui-text--row-right {
    align-items: center;
    justify-content: flex-end;
}

.nrdb-ui-text--row-spread {
    align-items: center;
    justify-content: space-between;
}
.nrdb-ui-text--col-center{
    align-items: center;
    justify-content: center;
    flex-direction: column;
}
</style>
