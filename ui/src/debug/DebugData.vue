<template>
    <pre v-if="data" style="padding: 12px; opacity: 0.5;">{{ data }}</pre>
    <p v-else style="padding: 12px; opacity: 0.5;">No Data Found</p>
</template>

<script>
export default {
    name: 'DebugData',
    props: {
        widget: { type: String, required: true },
        store: { type: String, required: true }
    },
    data () {
        return {
            data: null
        }
    },
    created () {
        const xhr = new XMLHttpRequest()
        xhr.open('GET', `/dashboard/_debug/${this.store}store/${this.widget}`)
        xhr.send()
        xhr.responseType = 'json'
        xhr.onload = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const data = xhr.response
                this.data = data
            } else {
                console.log(`Error: ${xhr.status}`)
            }
        }
    }
}
</script>
