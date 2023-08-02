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
        return () => h({
            props: ['id', 'props'],
            template: '<div>id: {{ id }}</div>' + props.props.format,
            computed: {
                ...mapState('data', ['values']),
                msg () {
                    return {
                        payload: this.values[this.id]
                    }
                }
            }
        }, {
            id: props.id,
            props: props.props
        })
    }
}
</script>

<style scoped>
</style>
