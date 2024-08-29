<template>
    <p>Dynamic properties are those that can be overriden at runtime by sending a particular <code>msg</code> to the node.</p>
    <p>Where appropriate, the underlying values set within Node-RED will be overriden by the values set in the received messages.</p>
    <table style="width: 100%;">
        <thead>
            <tr>
                <th>Prop</th>
                <th>Payload</th>
                <th>Structures</th>
                <th>Example Values</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(value, property) in page.frontmatter?.dynamic" :key="property">
                <td>{{ property }}</td>
                <td><code>{{ value.payload }}</code></td>
                <td>
                    <ul v-if="value.structure?.length > 1">
                        <li v-for="s in value.structure" :key="s"><code>{{ s }}</code></li>
                    </ul>
                    <code v-else>{{ value.structure[0] }}</code>
                </td>
                <td>
                    <div v-if="value.examples" style="display: flex; gap: 4px; align-items: center;">
                        <template v-for="(example, i) in value.examples" :key="example">
                            <code >{{ example }}</code>
                            <span v-if="i !== value.examples?.length - 1">|</span>
                        </template>
                    </div>
                </td>
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
    name: 'DynamicPropsTable'
}
</script>
