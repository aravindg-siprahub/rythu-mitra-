/**
 * Single Supabase browser client — re-export so we never create two GoTrueClient instances.
 * Always import from here OR from `config/supabaseClient` (same instance).
 */
export { supabase } from '../config/supabaseClient';
