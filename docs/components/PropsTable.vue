<template>
    <table style="width: 100%;">
        <thead>
            <tr>
                <th>Prop</th>
                <th>Dynamic</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(value, property) in page.frontmatter?.props" :key="property">
                <td>{{ property }}</td>
                <td style="text-align: center;">{{ value.dynamic ? '&#x2713;' : '' }}</td>
                <td v-html="value.description || value"></td>
            </tr>
        </tbody>
    </table>
</template>

<script setup>
import { useData } from 'vitepress' // eslint-disable-line import/named

const { page } = useData()
</script>

<script>
export default {
    name: 'PropsTable'
}
</script>
