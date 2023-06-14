<template>
    <div class="nrdb-layout nrdb-layout--flex">
        <div v-for="w in widgets" :key="w.id">
            {{ w.id }} {{  w.type }}
            <component :is="widget" />
        </div>
    </div>
</template>

<script type="text/javascript">

    import { markRaw } from 'vue'

    import UIText from '../widgets/ui_text/UIText.vue'

    export default {
        name: 'LayoutFlex',
        props: {
            widgets: {
                required: true,
                type: Array
            }
        },
        data: function () {
            return {
                widget: markRaw(UIText)
            }
        }
    }
</script>