<template>
  <div class="max-w-sm mx-auto mt-10 p-4 border rounded shadow">
    <h2 class="text-xl font-bold mb-4">Sign Up</h2>
    <form @submit.prevent="signup">
      <input
        v-model="email"
        type="email"
        placeholder="Enter email"
        class="w-full mb-3 px-3 py-2 border rounded"
        required
      />
      <input
        v-model="password"
        type="password"
        placeholder="Enter password"
        class="w-full mb-3 px-3 py-2 border rounded"
        required
      />
      <button
        type="submit"
        class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        Sign Up
      </button>
    </form>
    <p v-if="error" class="text-red-500 mt-3">{{ error }}</p>
    <p v-if="success" class="text-green-600 mt-3">Check your email to confirm your account!</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const email = ref('')
const password = ref('')
const error = ref('')
const success = ref(false)
const router = useRouter()

const signup = async () => {
  error.value = ''
  success.value = false
  const { data, error: signupError } = await supabase.auth.signUp({
    email: email.value,
    password: password.value
  })
  if (signupError) {
    error.value = signupError.message
  } else {
    success.value = true
    router.push('/login')
  }
}
</script> 