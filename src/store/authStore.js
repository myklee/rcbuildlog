import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)

  async function initialize() {
    try {
      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      
      user.value = session?.user || null
      
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        user.value = session?.user || null
      })

      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }

  async function signUp(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      user.value = null
    } catch (error) {
      console.error('Error signing out:', error)
      // Even if there's an error, clear the local user state
      user.value = null
      // Clear any local storage items
      localStorage.removeItem('supabase.auth.token')
      // Force reload the page to clear any remaining state
      window.location.href = '/'
    }
  }

  return {
    user,
    loading,
    initialize,
    signIn,
    signUp,
    signOut
  }
}) 