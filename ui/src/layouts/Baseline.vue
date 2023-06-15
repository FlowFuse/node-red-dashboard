<template>
    <v-app>
        <v-app-bar>
            <template v-slot:prepend>
                <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
            </template>
            <v-app-bar-title>{{ pageTitle }}</v-app-bar-title>
        </v-app-bar>
  
      <v-main>
        <v-navigation-drawer v-model="drawer">
            <v-list nav>
                <v-list-item v-for="page in pages" :key="page.id" prepend-icon="mdi-home" :title="`page.name (${page.route.path})`" @click="go(page.route.name)"></v-list-item>
            </v-list>
        </v-navigation-drawer>
        <slot></slot>
      </v-main>
    </v-app>
  </template>
  
  <script> 
  import {mapState} from 'vuex'
  
  export default {
      name: 'BaslineLayout',
      props: {
        pageTitle: {
            type: String,
            default: 'Page Title Here'
        }
      },
      computed: {
          ...mapState('ui', ['pages'])
      },
      data () {
        return {
            drawer: false
        }
      },
      methods: {
          go: function (name) {
              this.$router.push({
                  name
              })
          }
      }
  }
  </script>
  