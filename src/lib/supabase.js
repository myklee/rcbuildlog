// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uznciubceojoomrerddk.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bmNpdWJjZW9qb29tcmVyZGRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2ODgzNDgsImV4cCI6MjA2NDI2NDM0OH0.iDBCPQyxRegSHUF7vnFHa5k_kV19vs25DA3Yd5Cw9q4'

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration:', { url: supabaseUrl || 'missing', key: supabaseKey ? 'present' : 'missing' })
  throw new Error('Missing Supabase configuration')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  },
  global: {
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
})

// Test the connection
supabase.auth.getSession().then(({ data: { session }, error }) => {
  if (error) {
    console.error('Supabase connection test failed:', error)
  } else {
    console.log('Supabase connection test successful')
  }
})
