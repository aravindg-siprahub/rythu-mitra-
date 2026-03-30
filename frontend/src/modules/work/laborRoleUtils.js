/**
 * Labor Market roles: farmers post jobs; workers apply via supplier_profiles (legacy name in DB).
 * profiles.user_role may be "supplier" or "worker" — both require a supplier_profiles row to apply.
 */
export function isLaborProviderRole(role) {
  const r = (role || '').toLowerCase().trim();
  return r === 'supplier' || r === 'worker';
}

export function isFarmerRole(role) {
  return (role || '').toLowerCase().trim() === 'farmer';
}
