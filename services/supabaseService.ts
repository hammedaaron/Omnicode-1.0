
import { createClient } from '@supabase/supabase-js';

// Configuration: Priority to environment variables, fallback to user-provided keys
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mweltlnqnkbywpklxkow.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_8AFGWjJbIQHqBesX5HXO3Q_w0dhC_ic';

const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith('http'));

if (!isConfigured) {
  console.warn("OmniCode: Supabase configuration incomplete. Data will not persist to the cloud.");
}

// Export the client with a robust fallback to prevent application crashes
export const supabase = isConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ data: {}, error: new Error("Cloud synchronization is currently inactive.") }),
        signUp: async () => ({ data: {}, error: new Error("Cloud synchronization is currently inactive.") }),
        signOut: async () => {}
      },
      from: () => ({
        select: () => ({ 
          eq: () => ({ 
            order: () => ({ 
              limit: () => Promise.resolve({ data: [], error: null }) 
            }),
            single: () => Promise.resolve({ data: null, error: null }),
            maybeSingle: () => Promise.resolve({ data: null, error: null })
          }) 
        }),
        insert: () => Promise.resolve({ error: null }),
        upsert: () => Promise.resolve({ error: null }),
        delete: () => ({ 
          eq: () => Promise.resolve({ error: null }) 
        })
      })
    } as any;

export interface ConversionRecord {
  id?: string;
  source_language: string;
  target_language: string;
  source_code: string;
  target_code: string;
  error_context?: string;
  created_at?: string;
}

export const persistenceService = {
  async saveConversion(userId: string, record: ConversionRecord) {
    if (!isConfigured) return { error: null };
    const { error } = await supabase
      .from('conversions')
      .insert({ ...record, user_id: userId });
    return { error };
  },

  async getHistory(userId: string) {
    if (!isConfigured) return { data: [], error: null };
    const { data, error } = await supabase
      .from('conversions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);
    return { data, error };
  },

  async deleteHistory(userId: string) {
    if (!isConfigured) return { error: null };
    const { error } = await supabase
      .from('conversions')
      .delete()
      .eq('user_id', userId);
    return { error };
  },

  async saveState(userId: string, state: any) {
    if (!isConfigured) return { error: null };
    const { error } = await supabase
      .from('app_state')
      .upsert({ 
        user_id: userId,
        source_code: state.sourceCode,
        target_code: state.targetCode,
        source_language: state.sourceLanguage,
        target_language: state.targetLanguage,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    return { error };
  },

  async getState(userId: string) {
    if (!isConfigured) return { data: null, error: null };
    const { data, error } = await supabase
      .from('app_state')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    return { data, error };
  }
};
