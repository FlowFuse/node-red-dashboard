<template>
    <table style="width: 100%;">
        <thead>
            <tr>
                <th>Prop</th>
                <th>Type</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(value, property) in page.frontmatter?.props" :key="property">
                <td>{{ property }}</td>
                <td v-html="value"></td>
            </tr>
        </tbody>
    </table>
</template>

<script setup>
import { useData } from 'vitepress'

const { page } = useData()
</script>

<script>
export default {
    name: 'PropsTable'
}
</script>