// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uznciubceojoomrerddk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bmNpdWJjZW9qb29tcmVyZGRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2ODgzNDgsImV4cCI6MjA2NDI2NDM0OH0.iDBCPQyxRegSHUF7vnFHa5k_kV19vs25DA3Yd5Cw9q4'

export const supabase = createClient(supabaseUrl, supabaseKey)
