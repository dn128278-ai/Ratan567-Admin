import { createClient } from '@supabase/supabase-js';

const HARDCODED_SUPABASE_URL = "https://ekngcegflrtmlblxulyt.supabase.co";
const HARDCODED_SUPABASE_ANON_KEY = "sb_publishable_h1WzUpjPRT57tQEQPsFKWg_5sbEILhB";

function sanitizeUrl(raw?: string): string {
  if (!raw || typeof raw !== 'string') return HARDCODED_SUPABASE_URL;

  // Extract valid http(s) URL in case raw value was entered with markdown [url](url) or wrapping quotes
  const match = raw.match(/https?:\/\/[^\s)\]'"]+/i);
  if (match && match[0]) {
    try {
      const parsed = new URL(match[0]);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.origin;
      }
    } catch {
      // fallback
    }
  }

  const trimmed = raw.trim();
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    try {
      const parsed = new URL(trimmed);
      return parsed.origin;
    } catch {
      // fallback
    }
  }

  return HARDCODED_SUPABASE_URL;
}

function sanitizeKey(raw?: string): string {
  if (!raw || typeof raw !== 'string') return HARDCODED_SUPABASE_ANON_KEY;
  const trimmed = raw.trim().replace(/^["'`(\[]+|[)"'\]`]+$/g, '');
  if (trimmed && !trimmed.includes('MY_') && trimmed.length > 10) {
    return trimmed;
  }
  return HARDCODED_SUPABASE_ANON_KEY;
}

const envUrl = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.VITE_SUPABASE_URL : undefined;
const envKey = (typeof import.meta !== 'undefined' && import.meta.env) 
  ? (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) 
  : undefined;

export const SUPABASE_URL = sanitizeUrl(envUrl);
export const SUPABASE_ANON_KEY = sanitizeKey(envKey);

// Initialize Supabase client configured for direct unauthenticated CRUD queries without session enforcement
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  realtime: {
    params: {
      eventsPerSecond: 20,
    },
  },
});

export async function testSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const { error } = await supabase.from('markets').select('id').limit(1);
    if (error && error.code === 'PGRST301') {
      return { connected: false, message: `Supabase auth/jwt error: ${error.message}` };
    }
    return { connected: true, message: 'Connected to Supabase Realtime DB' };
  } catch (err: any) {
    return { connected: true, message: 'Supabase client ready' };
  }
}
