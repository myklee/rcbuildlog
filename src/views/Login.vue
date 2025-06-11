<template>
  <div class="max-w-sm mx-auto mt-10 p-4 border rounded shadow">
    <h2 class="text-xl font-bold mb-4">Login</h2>

    <input
      v-model="username"
      placeholder="Enter username"
      class="w-full mb-3 px-3 py-2 border rounded"
    />
    <input
      type="password"
      v-model="password"
      placeholder="Enter password"
      class="w-full mb-3 px-3 py-2 border rounded"
    />

    <button
      @click="login"
      class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
    >
      Login
    </button>

    <p v-if="loginFailed" class="text-red-500 mt-3">
      Invalid username or password
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '../store/dataStore'

const dataStore = useDataStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const loginFailed = ref(false)

const login = () => {
  dataStore.login(username.value, password.value)

  if (dataStore.isAuthenticated) {
    router.push('/user-home')
  } else {
    loginFailed.value = true
  }
}
</script>
