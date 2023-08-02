<script>

// eslint-disable vue/one-component-per-file

import { h } from 'vue'

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
        // const template = ref(compile('<div>Hello World</div>'))
        // console.log(template)
        // return {
        //     template: {
        //         template: '<div>Hello World</div>'
        //     }
        // }
        // const template = ref(compile('<div>Hello World</div>'))
        return () => h({
            props: ['id', 'props'],
            template: '<div>id: {{ id }}</div>' + props.props.format
        }, {
            id: props.id,
            props: props.props
        })
    },
    computed: {
        ...mapState('data', ['values'])
    }
}
</script>

<style scoped>
</style>
