<template>
  <div id="app">
    <!-- Navigation Bar -->
    <nav>
      <router-link to="/">Home</router-link>
      <router-link v-if="loggedInUser" to="/user-home">User home</router-link>
      <router-link v-if="!loggedInUser" to="/login">Login</router-link>
      <router-link v-if="!loggedInUser" to="/signup">Sign Up</router-link>
    </nav>

    <!-- Router View for active page -->
    <router-view />
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useDataStore } from "./store/dataStore";

const dataStore = useDataStore();
const loggedInUser = computed(() => dataStore.loggedInUser);

onMounted(async () => {
  await dataStore.initialize();
});
</script>

<style>
nav {
  padding: 1rem;
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
