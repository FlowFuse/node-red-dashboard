<template>
    <v-app-bar :elevation="2">
        <template v-slot:prepend>
          <v-app-bar-nav-icon></v-app-bar-nav-icon>
        </template>
        <v-app-bar-title>Page Title Here</v-app-bar-title>
    </v-app-bar>
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
  @import "./header.css";
  </style>
  