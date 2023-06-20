<template>
    <v-app class="nrdb-app nrdb-app--baseline">
        <v-app-bar>
            <template v-slot:prepend>
                <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
            </template>
            <v-app-bar-title>{{ pageTitle }}</v-app-bar-title>
        </v-app-bar>
  
      <v-main>
        <v-navigation-drawer v-model="drawer">
            <v-list nav>
                <v-list-item v-for="page in pages" :key="page.id" active-class="v-list-item--active"
                    prepend-icon="mdi-home" :title="`${page.route.name} (${page.route.path})`"
                    :to="{name: page.route.name}" link></v-list-item>
            </v-list>
        </v-navigation-drawer>
        <slot class="nrdb-layout"></slot>
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
  
  <style scoped>
  .v-list-item--active {
    background-color: var(--v-theme-background);
  }
  </style>