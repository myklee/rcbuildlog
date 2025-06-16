import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    session: null,
    loading: true,
    error: null,
    lastCheck: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.session,
    userId: (state) => state.user?.id
  },

  actions: {
    async initialize() {
      try {
        this.loading = true
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error
        
        if (session) {
          this.session = session
          this.user = session.user
        }

        // Set up visibility change listener
        document.addEventListener('visibilitychange', this.handleVisibilityChange)
      } catch (error) {
        console.error('Auth initialization error:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        await this.checkSession()
      }
    },

    async checkSession() {
      try {
        // Don't check more often than every 2 minutes
        const currentTime = Date.now()
        if (this.lastCheck && currentTime - this.lastCheck < 120000) {
          return this.isAuthenticated
        }
        
        this.lastCheck = currentTime
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          this.session = null
          this.user = null
          return false
        }
        
        // Check if session is expired or about to expire (within 5 minutes)
        const expiresAt = new Date(session.expires_at * 1000)
        const currentDate = new Date()
        const fiveMinutes = 5 * 60 * 1000
        
        if (expiresAt.getTime() - currentDate.getTime() < fiveMinutes) {
          const { data: { session: newSession }, error: refreshError } = 
            await supabase.auth.refreshSession()
          
          if (refreshError || !newSession) {
            this.session = null
            this.user = null
            return false
          }
          
          this.session = newSession
          this.user = newSession.user
        }
        
        return true
      } catch (error) {
        console.error('Session check failed:', error)
        this.session = null
        this.user = null
        return false
      }
    },

    async signOut() {
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        
        this.session = null
        this.user = null
        this.lastCheck = null
      } catch (error) {
        console.error('Sign out error:', error)
        this.error = error.message
      }
    }
  }
})

// Set up auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  const authStore = useAuthStore()
  
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    authStore.session = session
    authStore.user = session?.user
  } else if (event === 'SIGNED_OUT') {
    authStore.session = null
    authStore.user = null
    authStore.lastCheck = null
  }
}) 