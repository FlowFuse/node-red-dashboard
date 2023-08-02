<template>
    <div class="nrdb-ui-widget">
        Using v-html= -
        <div v-html="props.format" />
        {{ props.format }}
        Using component :is -
        <component :is="template" />
    </div>
</template>

<script>

// eslint-disable vue/one-component-per-file

import { defineComponent, markRaw } from 'vue'

import { useDataTracker } from '../data-tracker.js' // eslint-disable-line import/order
import { mapState } from 'vuex' // eslint-disable-line import/order
// import UIButton from '../ui-button/UIButton.vue' // eslint-disable-line import/order

export default {
    name: 'DBUITemplate',
    inject: ['$socket'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) }
    },
    setup (props) {
        useDataTracker(props.id)
    },
    data () {
        console.log('data')
        // eslint-disable-next-line vue/one-component-per-file
        const options = markRaw(defineComponent({
            template: '<div>Template Component</div>'
        }))

        console.log(options)

        // const template = defineAsyncComponent(() => {
        //     console.log('inside async')
        //     return new Promise((resolve, reject) => {
        //         console.log(UIButton)
        //         // ...load component from server
        //         resolve({
        //             name: 'UITemplate',
        //             render () {
        //                 return h({ render: compile('<div>Template Component</div>') })
        //             }
        //         })
        //     })
        // })
        // console.log(template)
        // const template = defineAsyncComponent(() => import('../ui-button/UIButton.vue'))
        return {
            template: options
        }
    },
    computed: {
        ...mapState('data', ['values'])
    }
}
</script>

<style scoped>
</style>
