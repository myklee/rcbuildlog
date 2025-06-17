import { createApp } from "vue";
import App from "./App.vue";
// import router from './router';
import router from "./router";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { useDataStore } from "./store/dataStore";
import { useAuthStore } from "./store/authStore";

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);

// Initialize stores before mounting
const dataStore = useDataStore();
const authStore = useAuthStore();

Promise.all([
  dataStore.initialize(),
  authStore.initialize()
]).then(() => {
  app.mount("#app");
});
