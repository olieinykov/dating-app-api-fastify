import { createClient } from '@supabase/supabase-js';
import env from '../config/env.js';

export const supabase = createClient(env.supabase.url, env.supabase.key);
export const supabaseAdmin = createClient(env.supabase.url, env.supabase.adminKey);
