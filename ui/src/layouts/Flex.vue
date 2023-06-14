<template>
    <div class="nrdb-layout nrdb-layout--flex">
        {{ widgets }}
        <div v-for="w in widgets" :key="w.id">
            {{ w.id }} {{  w.type }}
            <component :is="w.type" />
        </div>
    </div>
</template>

<script>

    import { markRaw } from 'vue'

    import UIText from '../widgets/ui-text/UIText.vue'

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