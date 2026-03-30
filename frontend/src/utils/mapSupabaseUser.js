/**
 * Normalize Supabase Auth user for screens that expect legacy `rythu_user` / `user` shape.
 */
export function mapSupabaseUserToAppUser(authUser) {
  if (!authUser) return null;
  const meta = authUser.user_metadata || {};
  const email = authUser.email || '';
  const local = email.includes('@') ? email.split('@')[0] : email;
  return {
    id: authUser.id,
    user_id: authUser.id,
    email,
    full_name: meta.full_name || meta.name || local || 'User',
    phone: meta.phone || '',
    district: meta.district,
    profile: meta,
  };
}

/** Persist legacy key used by WorkPage, apiService cleanup, etc. */
export function persistAppUserSnapshot(user) {
  if (!user) return;
  try {
    const json = JSON.stringify(user);
    localStorage.setItem('rythu_user', json);
    localStorage.setItem('user', json);
  } catch {
    /* ignore quota */
  }
}

const ROLE_KEY = 'rm_role';

/**
 * If localStorage has no role, load profiles.user_role once and cache it.
 * Keeps returning users from being sent to /select-role every login.
 */
export async function hydrateLaborRoleFromProfile(supabaseClient, userId) {
  if (!userId || !supabaseClient) return null;
  try {
    const existing = localStorage.getItem(ROLE_KEY);
    if (existing && existing.trim()) return existing.trim();

    const { data, error } = await supabaseClient
      .from('profiles')
      .select('user_role, role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('[auth] profile role lookup:', error.message);
      return null;
    }

    const r = (data?.user_role || data?.role || '').toLowerCase().trim();
    if (r) {
      localStorage.setItem(ROLE_KEY, r);
      return r;
    }
  } catch (e) {
    console.warn('[auth] hydrateLaborRoleFromProfile', e);
  }
  return null;
}

/** Where to send the user after login when role is known (matches RoleSelect). */
export function getHomePathForRole(role) {
  const r = (role || '').toLowerCase();
  if (r === 'supplier' || r === 'worker') return '/work';
  if (r === 'farmer') return '/dashboard';
  return '/select-role';
}
