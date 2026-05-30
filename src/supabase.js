import { createClient } from '@supabase/supabase-js'

const URL  = 'https://rnneagijosmsvbakzhpc.supabase.co'
const KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(URL, KEY)

export async function logLookup(tool, query, userId = null) {
  if (!KEY) return
  try {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('lookup_logs').insert({
      user_id: user?.id || userId,
      tool,
      query: query.substring(0, 200), // truncate — no PII beyond what user typed
      created_at: new Date().toISOString(),
    })
  } catch (_) {}
}
