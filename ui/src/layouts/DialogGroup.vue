<!-- eslint-disable vue/html-self-closing -->
<template>
    <v-dialog v-if="group.groupType === 'dialog'" v-model="isActive" :attach="`nrdb-ui-group-${group.id}`" :style="dialogStyles">
        <v-card>
            <template v-if="group.showTitle" #title>
                {{ getGroupName(group) }}
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
import { mapGetters } from 'vuex'

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
            windowWidth: window.innerWidth
        }
    },
    computed: {
        ...mapGetters('i18n', ['currentLocale']),
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
        showDialogState: {
            handler (val) {
                const state = val.split('-')[0] === 'true'
                // Close the dialog if it's already opened by ui-control
                if (state === this.isActive) {
                    this.isActive = !this.isActive
                }
                this.isActive = state
            }
        }
    },
    mounted () {
        // on resize handler for window resizing
        window.addEventListener('resize', this.onResize)
    },
    methods: {
        getGroupName (group) {
            if (!group.name) return ''
            if (typeof group.name === 'string') {
                return group.name
            }
            if (typeof group.name === 'object') {
                // Try current locale first
                if (group.name[this.currentLocale]) {
                    return group.name[this.currentLocale]
                }
                // Fallback to English
                if (group.name.en) {
                    return group.name.en
                }
                // Fallback to original
                if (group.name.original) {
                    return group.name.original
                }
                // Fallback to first available translation
                const keys = Object.keys(group.name)
                if (keys.length > 0) {
                    return group.name[keys[0]]
                }
            }
            return String(group.name)
        },
        onResize () {
            this.windowWidth = window.innerWidth
        }
    }
}
</script>
