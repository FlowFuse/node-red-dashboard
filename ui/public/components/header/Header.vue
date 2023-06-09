<template>
    <nav class="nrdb-header">
      <h1>Hello World Header</h1>
    </nav>
  </template>
  
  <script>
  export default {
    name: 'DBHeader',
    props: {
      msg: String
    }
  }
  </script>
  
  <style scoped>
  @import "./components/header/header.css";
  </style>
  