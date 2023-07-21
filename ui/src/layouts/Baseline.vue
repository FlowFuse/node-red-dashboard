<template>
    <v-app class="nrdb-app nrdb-app--baseline">
        <v-app-bar :elevation="1">
            <template v-slot:prepend>
                <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
            </template>
            <v-app-bar-title>{{ pageTitle }}</v-app-bar-title>
        </v-app-bar>
  
      <v-main>
        <v-navigation-drawer v-model="drawer">
            <v-list nav>
                <v-list-item v-for="page in pages" :key="page.id" active-class="v-list-item--active"
                    prepend-icon="mdi-home" :title="`${page.route.name} (${page.route.path})`"
                    :to="{name: page.route.name}" link></v-list-item>
            </v-list>
        </v-navigation-drawer>
        <slot class="nrdb-layout"></slot>
      </v-main>
    </v-app>
</template>
  
<script>
import {mapState} from 'vuex'

/**
 * Convert a hex to RGB color
 * @param {String(hex)} hex 
 */
function hexToRgb(hex) {
    const bigint = parseInt(hex.replace('#', ''), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
}

/**
 * Given a hex color code to represent a bg, return an appropriately contrasting text color
 * @param {String(hex)} bg 
 */
function getContrast(bg) {
    const bgRgb = hexToRgb(bg);

    // http://www.w3.org/TR/AERT#color-contrast
    const brightness = Math.round(((parseInt(bgRgb[0]) * 299) +
                        (parseInt(bgRgb[1]) * 587) +
                        (parseInt(bgRgb[2]) * 114)) / 1000);

    const textColor = (brightness > 125) ? '#000000' : '#ffffff';
    console.log('textColor', textColor)
    return textColor;
}

export default {
    name: 'BaslineLayout',
    props: {
        pageTitle: {
            type: String,
            default: 'Page Title Here'
        }
    },
    computed: {
        ...mapState('ui', ['pages', 'themes']),
        theme: function () {
            const page = this.pages[this.$route.meta.id]
            const theme = this.themes[page.theme].colors
            return theme
        }
    },
    watch: {
        theme: function () {
            this.updateTheme()
        }
    },
    data () {
        return {
            drawer: false
        }
    },
    methods: {
        go: function (name) {
            this.$router.push({
                name
            })
        },
        updateTheme() {
            const theme = this.$vuetify.theme.themes["nrdb"].colors
            // convert NR Theming to Vuetify Theming
            theme.surface = this.theme.surface
            // primary bg
            theme.primary = this.theme.primary
            // primary font - auto calculated
            theme['on-primary'] = getContrast(this.theme.primary)
            // UI Background
            theme.background = this.theme.bgPage
            // Group Background
            theme['group-background'] = this.theme.groupBg
            theme['group-outline'] = this.theme.groupOutline
        }
    },
    mounted () {
        this.updateTheme()
    }
}
</script>
  
<style>
.v-list-item--active {
    background-color: var(--v-theme-background);
}
/**
 * Override the default Vuetify theme by making 'primary' the main colour for widgets, rather than 'surface'
 */
.v-btn--variant-elevated, .v-btn--variant-flat {
    background-color: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary));
}
.v-btn--variant-elevated, .v-btn--variant-flat {
    background-color: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary));
}

.v-card {
    border: 1px solid rgb(var(--v-theme-group-outline));
}

/* focused border color */
.v-field--variant-outlined.v-field--focused .v-field__outline__end,
.v-field--variant-outlined.v-field--focused .v-field__outline__notch:after,
.v-field--variant-outlined.v-field--focused .v-field__outline__notch:before,
.v-field--variant-outlined.v-field--focused .v-field__outline__start {
    border-color: rgb(var(--v-theme-primary));
}

/* dropdown list items */
.v-menu>.v-overlay__content>.v-card, .v-menu>.v-overlay__content>.v-list, .v-menu>.v-overlay__content>.v-sheet {
    background: rgb(var(--v-theme-background));
    color: rgb(var(--v-theme-on-background));
}

.v-slider-track__background,
.v-slider-track__fill,
.v-slider-track__tick,
.v-slider-thumb__surface {
    background-color: rgb(var(--v-theme-primary));
}

</style>