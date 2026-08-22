import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yzzfxoefwjrzbzxkqlnn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_fB0CCFlfwiGFSg6Hqs3LPw_Mrg68Dv4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
