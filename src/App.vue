<template>
  <div id="app">
    <!-- Navigation Bar -->
    <nav>
      <router-link to="/">Home</router-link>
      <router-link v-if="loggedInUser" to="/user-home">User home</router-link>
      {{ console.log(loggedInUser) }}
      <router-link v-if="!loggedInUser" to="/user-home">Login</router-link>
    </nav>

    <!-- Router View for active page -->
    <router-view />
  </div>
</template>

<script setup>
// No script logic needed here yet
//Q5hv3MHDWB9goBno Supabase password
//EcNSjddg6yQo85dZ
import { computed } from "vue";
import { useDataStore } from "./store/dataStore";

const dataStore = useDataStore();
const loggedInUser = computed(() => dataStore.loggedInUser);
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

nav {
  padding: 10px;
}

nav a {
  margin-right: 15px;
  text-decoration: none;
  color: #42b983;
  font-weight: 600;
}

nav a:hover {
  color: #35495e;
}
</style>
