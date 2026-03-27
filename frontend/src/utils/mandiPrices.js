const AGMARKNET_BASE = 
  'https://api.data.gov.in/resource/' +
  '9ef84268-d588-465a-a308-a864a43d0070';
const DATA_GOV_KEY = 
  '579b464db66ec23bdd000001' +
  'cdd3497f5ce9477d75b26c6d' +
  '0d539e3';
export async function fetchMandiPrice(
  commodity, 
  district
) {
  if (!commodity || !district) return null;
  try {
    const params = new URLSearchParams({
      'api-key':  DATA_GOV_KEY,
      format:     'json',
      limit:      '5',
      'filters[commodity]': commodity,
      'filters[district]':  district,
    });
    const targetUrl = `${AGMARKNET_BASE}?${params}`;
    const res = await fetch(
      `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const records = data.records || [];
    if (!records.length) return null;
    // Get most recent price
    const latest = records.sort((a, b) => 
      new Date(b.arrival_date) - 
      new Date(a.arrival_date)
    )[0];
    return {
      minPrice:    parseFloat(latest.min_price  || 0),
      maxPrice:    parseFloat(latest.max_price  || 0),
      modalPrice:  parseFloat(latest.modal_price|| 0),
      market:      latest.market,
      district:    latest.district,
      date:        latest.arrival_date,
      commodity:   latest.commodity,
    };
  } catch {
    return null;
  }
}
export function formatMandiPrice(priceData) {
  if (!priceData) return null;
  const min = Math.round(priceData.minPrice);
  const max = Math.round(priceData.maxPrice);
  return `₹${min.toLocaleString('en-IN')}` +
         ` - ₹${max.toLocaleString('en-IN')}/qtl`;
}
