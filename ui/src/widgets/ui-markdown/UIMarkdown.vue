<template>
    <vue-markdown class="nrdb-ui-widget nrdb-ui-markdown" :source="props.content" />
</template>

<script>
    import { useDataTracker } from '../data-tracker.js'
    import { mapState } from 'vuex'

    import VueMarkdown from 'vue-markdown-render'

    export default {
        name: 'DBUIMarkdown',
        inject: ['$socket'],
        props: {
            id: String,
            props: Object
        },
        components: {
            VueMarkdown
        },
        computed: {
            ...mapState('data', ['values']),
        },
        created () {
            useDataTracker(this.id)
        }
    }
</script>
  
<style lang="css">
.nrdb-ui-markdown h1 {
    margin: 0.67em 0;
}
.nrdb-ui-markdown h2 {
    margin: 0.5em 0;
}
.nrdb-ui-markdown h3 {
    margin: 0.25em 0;
}
.nrdb-ui-markdown ul {
    padding: 0 0 0 1em;
}
.nrdb-ui-markdown p {
    margin: 0.25em 0 1em;
}
.nrdb-ui-markdown blockquote {
    padding-left: 1em;
    border-left: 4px solid #d1d1d1;
    color: gray;
}
</style>
  