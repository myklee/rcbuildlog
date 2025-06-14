<template>
  <div class="max-w-sm mx-auto mt-10 p-4 border rounded shadow">
    <h2 class="text-xl font-bold mb-4">Login</h2>

    <form @submit.prevent="handleLogin">
      <input
        v-model="email"
        placeholder="Enter email"
        class="w-full mb-3 px-3 py-2 border rounded"
      />
      <input
        type="password"
        v-model="password"
        placeholder="Enter password"
        class="w-full mb-3 px-3 py-2 border rounded"
      />

      <button
        type="submit"
        class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Login
      </button>
    </form>

    <p v-if="errorMessage" class="text-red-500 mt-3">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '../store/dataStore'

const dataStore = useDataStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const errorMessage = ref('')

const handleLogin = async () => {
  try {
    const success = await dataStore.login(email.value, password.value)
    if (success) {
      console.log('Login successful, redirecting to user home')
      router.push('/user-home')
    } else {
      errorMessage.value = 'Invalid email or password'
    }
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = error.message || 'An error occurred during login'
  }
}
</script>
