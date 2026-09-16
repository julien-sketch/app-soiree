import { createClient } from '@supabase/supabase-js'

let client

// Lazy initialization: a missing configuration must never prevent the quiz loading.
export function getSupabaseClient() {
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !/^https?:\/\//.test(url) || !key) {
    throw new Error('Configuration publique Supabase manquante ou invalide.')
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) => fetch(input, {
        ...init,
        // Bound network failures without blocking the results or animations.
        signal: init?.signal
          ? AbortSignal.any([init.signal, AbortSignal.timeout(10000)])
          : AbortSignal.timeout(10000),
      }),
    },
  })

  return client
}
