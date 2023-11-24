<template>
    <table style="width: 100%;">
        <thead>
            <tr>
                <th>Event/Topic</th>
                <th>Payload</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="e in page.frontmatter?.events" :key="e.event">
                <td><code>{{ e.event }}</code></td>
                <td><code>{{ e.payload }}</code></td>
                <td v-html="e.description"></td>
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
    name: 'EventsListTable'
}
</script>
