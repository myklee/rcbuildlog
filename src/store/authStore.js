import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)

  // Add computed properties for auth state
  const isAuthenticated = computed(() => !!user.value)
  const userId = computed(() => user.value?.id)

  async function initialize() {
    try {
      loading.value = true
      console.log('Initializing auth store...')
      
      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error)
        throw error
      }
      
      if (session) {
        console.log('Found session:', session)
        user.value = session.user
      } else {
        console.log('No session found')
        user.value = null
      }
      
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session?.user)
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          user.value = session?.user || null
        } else if (event === 'SIGNED_OUT') {
          user.value = null
        }
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
      loading.value = true
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      user.value = data.user
      return data
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function signUp(email, password) {
    try {
      loading.value = true
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      if (error) throw error
      user.value = data.user
      return data
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    try {
      loading.value = true
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
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    isAuthenticated,
    userId,
    initialize,
    signIn,
    signUp,
    signOut
  }
}) 