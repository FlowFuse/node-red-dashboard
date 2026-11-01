<!-- eslint-disable vue/html-self-closing -->
<template>
    <v-dialog v-if="group.groupType === 'dialog'" v-model="isActive" :persistent="persistent" :attach="`nrdb-ui-group-${group.id}`" :style="dialogStyles">
        <v-card>
            <template v-if="group.showTitle" #title>
                {{ group.name }}
            </template>
            <template #append>
                <v-btn variant="plain" density="compact" icon="mdi-close" @click="isActive = false" />
            </template>
            <template #text>
                <slot></slot>
            </template>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'DialogGroup',
    props: {
        group: {
            type: Object,
            required: true
        },
        widgetsByGroup: {
            type: Function,
            required: true
        }
    },
    data () {
        return {
            isActive: false,
            persistent: false,
            windowWidth: window.innerWidth
        }
    },
    computed: {
        showDialogState () {
            return this.group.showDialog
        },
        dialogStyles () {
            let groupWidth = this.group.width || 12
            if (this.deviceType === 'mobile') {
                // Dialogs should take up the full width on mobile
                groupWidth = 12
            } else if (this.deviceType === 'tablet') {
                // Dialogs should take up 50% of the width on tablet if the column size 6 or less
                groupWidth = (() => {
                    if (groupWidth <= 6) {
                        return 6
                    } else {
                        return groupWidth
                    }
                })()
            }
            return {
                'max-width': `${Math.min(Math.max((groupWidth / 12 * 100).toFixed(2), 0), 100)}%`
            }
        },
        deviceType () {
            if (this.windowWidth <= 768) {
                return 'mobile'
            } else if (this.windowWidth <= 1024) {
                return 'tablet'
            } else {
                return 'desktop'
            }
        }
    },
    watch: {
        showDialogState (val) {
            this.applyDialogState(val)
        },
        isActive (val) {
            // keep the store in step when the user closes the dialog, so the next "show" is a real change
            if (!val && this.showDialogState?.startsWith('true')) {
                this.setDialogState(false)
            }
        }
    },
    mounted () {
        // on resize handler for window resizing
        window.addEventListener('resize', this.onResize)
        // a show can arrive before this page has rendered (e.g. navigate + show in one go)
        if (this.showDialogState) {
            this.applyDialogState(this.showDialogState)
        }
    },
    beforeUnmount () {
        window.removeEventListener('resize', this.onResize)
        // leaving the page closes the dialog, don't reopen it on return
        if (this.isActive) {
            this.setDialogState(false)
        }
    },
    methods: {
        onResize () {
            this.windowWidth = window.innerWidth
        },
        applyDialogState (val) {
            const parts = val.split('-')
            const state = parts[0] === 'true'
            // "modal" only closes via its close button
            this.persistent = state && parts[2] === 'modal'
            this.isActive = state
        },
        setDialogState (state) {
            this.$store.commit('ui/setProperty', {
                item: 'group',
                itemId: this.group.id,
                property: 'showDialog',
                value: `${state}-${Date.now()}`
            })
        }
    }
}
</script>
