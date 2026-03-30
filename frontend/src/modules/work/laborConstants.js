/** Shared constants and helpers for the Labor Market module. */

export const JOB_CATEGORIES = [
  {
    id: 'worker',
    label: 'Worker',
    emoji: '🧑‍🌾',
    color: '#166534',
    bg: '#f0fdf4',
    border: '#86efac',
    description: 'Hire daily wage workers for harvesting, planting, weeding and general farm tasks.',
    typical_rate: '₹400–700/day',
    typical_need: '1–20 workers',
    popular_for: ['Harvesting', 'Planting', 'Weeding', 'Spraying'],
  },
  {
    id: 'tractor',
    label: 'Tractor',
    emoji: '🚜',
    color: '#1d4ed8',
    bg: '#eff6ff',
    border: '#bfdbfe',
    description: 'Hire tractors for ploughing, tilling, and land preparation.',
    typical_rate: '₹800–1500/hour',
    typical_need: '1 tractor',
    popular_for: ['Ploughing', 'Tilling', 'Land Leveling'],
  },
  {
    id: 'transport',
    label: 'Transport',
    emoji: '🚛',
    color: '#92400e',
    bg: '#fffbeb',
    border: '#fcd34d',
    description: 'Hire lorries, tractors, and transport vehicles for carrying produce to mandi or materials to farm.',
    typical_rate: '₹800–2000/trip',
    typical_need: '1–3 vehicles',
    popular_for: ['Lorry to mandi', 'Produce delivery', 'Sand transport'],
  },
  {
    id: 'sprayer',
    label: 'Sprayer',
    emoji: '💨',
    color: '#6b21a8',
    bg: '#f5f3ff',
    border: '#c4b5fd',
    description: 'Hire sprayer machines, pump sets, and farm equipment operators for pesticide and irrigation work.',
    typical_rate: '₹300–600/day',
    typical_need: '1–2 units',
    popular_for: ['Pesticide spraying', 'Drone spraying'],
  },
];

export const WORK_TYPES_BY_CATEGORY = {
  worker: ['Harvesting', 'Planting', 'Spraying', 'Weeding', 'Loading', 'Other'],
  tractor: ['Ploughing', 'Tilling', 'Land Leveling', 'Other'],
  transport: ['Lorry to mandi', 'Produce delivery', 'Sand transport', 'Other'],
  sprayer: ['Pesticide spraying', 'Pump set rental', 'Drone spraying', 'Other'],
};

export const DISTRICTS = ['Annamayya (Madanapalle)', 'Chittoor', 'Tirupati', 'Anantapur', 'Kadapa', 'SPSR Nellore'];
export const SKILLS = ['Harvesting', 'Ploughing', 'Seeding', 'Pesticide Spray', 'General Labor'];

export const SERVICES = [
  { id: 'worker', label: 'Labor' },
  { id: 'tractor', label: 'Tractor' },
  { id: 'transport', label: 'Transport' },
  { id: 'sprayer', label: 'Sprayer' },
];

export const JOB_ICONS = {
  worker: '👷',
  labour: '👷',
  tractor: '🚜',
  transport: '🚛',
  sprayer: '💨',
  equipment: '🔧',
};

export function getJobIcon(type) {
  return JOB_ICONS[(type || '').toLowerCase()] || '🌾';
}

export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function generateJobTitle(wType, crop, workers, location, date) {
  const workerText = parseInt(workers, 10) > 1 ? `${workers} workers` : '1 worker';
  const dateStr = date
    ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : '';
  const parts = [crop, wType, '—', workerText, 'needed'];
  if (location) parts.push('·', location);
  if (dateStr) parts.push('·', dateStr);
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

export function getSafeName(name, isSelected) {
  if (!name) return 'Farmer';
  if (name.includes('@')) return 'Farmer';
  if (isSelected) return name;
  return name.split(' ')[0];
}
