// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch {
  throw new Error('Invalid Supabase URL format. Please check VITE_SUPABASE_URL in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We don't need user sessions for visitor management
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'ottohello-visitor-management',
    },
  },
});

// Test connection on initialization
supabase
  .from('visitors')
  .select('count', { count: 'exact', head: true })
  .then(({ error }) => {
    if (error) {
      console.error('[SUPABASE] Connection test failed:', error.message);
    } else {
      console.log('[SUPABASE] Connection successful');
    }
  });