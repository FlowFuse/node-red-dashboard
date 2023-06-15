<template>
    This is the text widget {{  id }}
</template>
  
<script>
    export default {
        name: 'DBUIText',
        props: {
            id: String,
            msg: String,
        },
        mounted () {
            console.log("msg-input:" + this.id)
            this.$socket.on("msg-input:" + this.id, (msg) => {
                console.log("msg received")
                console.log(msg.topic, msg.payload)
            })
        },
        unmounted () {
            this.$socket.off("msg-input:" + this.id)
        }
    }
</script>
  
<style scoped>
    /* @import "./components/header/header.css"; */
</style>
  