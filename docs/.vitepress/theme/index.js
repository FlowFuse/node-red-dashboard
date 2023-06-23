import DefaultTheme from 'vitepress/theme'
import { onMounted } from 'vue';
import mediumZoom from 'medium-zoom';
// override options: https://github.com/vuejs/vitepress/blob/main/src/client/theme-default/styles/vars.css
import './dashboard.css'
import './overlay.css'

import PropsTable from '../../components/PropsTable.vue'
import ControlsTable from '../../components/ControlsTable.vue'

export default {
    extends: DefaultTheme,
    setup() {
        onMounted(() => {
            mediumZoom('[data-zoomable]', {
                background: 'black',
                margin: 24
            });
        })
    },
    enhanceApp(ctx) {
        // register your custom global components
        ctx.app.component('PropsTable', PropsTable)
        ctx.app.component('ControlsTable', ControlsTable)
    }
  }