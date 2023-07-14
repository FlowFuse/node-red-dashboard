<template>
    <div class="nrdb-ui-widget nrdb-ui-text" :class="'nrdb-ui-text--' + props.layout">
        <label class="nrdb-ui-text-label">{{ props.label }}</label>
        <span class="nrdb-ui-text-value">{{ (values && values[id]) || 'No Message Received' }}</span>
    </div>
</template>

<script>
    import { useDataTracker } from '../data-tracker.js'
    import { mapState } from 'vuex'

    export default {
        name: 'DBUIText',
        props: {
            id: String,
            props: Object
        },
        computed: {
            ...mapState('data', ['values']),
        },
        setup (props) {
            useDataTracker(props.id)
        }
    }
</script>
  
<style scoped>
/* Base Styling */
.nrdb-ui-text {
    display: flex;
    flex-direction: row;
    gap: 2px;
}
.nrdb-ui-text-label {}
.nrdb-ui-text-value {
    font-weight: 600;
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
  