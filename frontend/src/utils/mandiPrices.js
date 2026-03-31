/**
 * mandiPrices.js
 * Fetches live mandi prices via our Django backend (/api/v1/market/mandi-price/).
 * No more allorigins.win CORS proxy — backend calls api.data.gov.in directly.
 */
import apiService from '../services/apiService';

/**
 * Fetch live mandi price for a commodity + district.
 * @param {string} commodity  e.g. "Wheat", "Chickpea"
 * @param {string} district   e.g. "Kurnool", "Warangal"
 * @returns {object|null}     Price data or null on failure
 */
export async function fetchMandiPrice(commodity, district) {
  if (!commodity || !district) return null;

  try {
    const res = await apiService.get(
      `/market/mandi-price/?commodity=${encodeURIComponent(commodity)}&district=${encodeURIComponent(district)}`
    );
    const data = res;

    // No records found for this combination
    if (!data || (data.records && data.records.length === 0)) return null;

    return {
      minPrice:   data.minPrice   ?? 0,
      maxPrice:   data.maxPrice   ?? 0,
      modalPrice: data.modalPrice ?? 0,
      market:     data.market     ?? '',
      district:   data.district   ?? district,
      date:       data.date       ?? '',
      commodity:  data.commodity  ?? commodity,
    };
  } catch (err) {
    console.warn('[mandiPrices] Failed to fetch mandi price:', err?.response?.data || err.message);
    return null;
  }
}

/**
 * Format mandi price for display.
 * @param {object|null} priceData
 * @returns {string|null}
 */
export function formatMandiPrice(priceData) {
  if (!priceData) return null;
  const min = Math.round(priceData.minPrice);
  const max = Math.round(priceData.maxPrice);
  return `₹${min.toLocaleString('en-IN')} - ₹${max.toLocaleString('en-IN')}/qtl`;
}
