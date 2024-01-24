<template>
    <table style="width: 100%;">
        <thead>
            <tr>
                <th>Prop</th>
                <th v-if="!hideDynamic">Dynamic</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(value, p) in properties" :key="p">
                <td>{{ p }}</td>
                <td v-if="!hideDynamic" style="text-align: center;">{{ value.dynamic ? '&#x2713;' : '' }}</td>
                <td v-html="value.description || value"></td>
            </tr>
        </tbody>
    </table>
</template>

<script>
export default {
    name: 'PropsTable',
    props: {
        property: {
            type: String,
            default: null
        },
        hideDynamic: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        properties: function () {
            if (!this.property) {
                return this.$frontmatter?.props || {}
            } else {
                return this.$frontmatter[this.property] || {}
            }
        }
    }
}
</script>
