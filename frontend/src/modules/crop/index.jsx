import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SeasonBanner from '../../components/ui/SeasonBanner';
import { useCropRecommendation, FIELD_LIMITS } from './hooks/useCropPrediction';
import { getSavedLocation, cleanLocationName, detectLocationFromGPS, saveLocation, getFarmerDistrict, getFarmerState } from '../../utils/locationService';
import { fetchMandiPrice, formatMandiPrice } from '../../utils/mandiPrices';
const calculateFarmIncome = (crop, farmAcres) => {
  try {
    const acres = parseFloat(farmAcres);
    if (!acres || acres <= 0) return null;
    const hectares = acres * 0.4047;
    // Parse yield — GPT returns "4-6 tonnes/hectare" or "16-24 qtl"
    const yieldStr = (crop.expected_yield || '3-5 tonnes/hectare').toString().toLowerCase();
    const yieldNums = yieldStr.match(/[\d.]+/g);
    const rawYieldMin = yieldNums ? parseFloat(yieldNums[0]) : 3;
    const rawYieldMax = yieldNums && yieldNums[1] ? parseFloat(yieldNums[1]) : rawYieldMin + 1;
    const isQuintals = yieldStr.includes('qtl') || yieldStr.includes('quintal');
    const isPerAcre = yieldStr.includes('/acre') || yieldStr.includes('per acre');
    let yieldMinQtl = rawYieldMin;
    let yieldMaxQtl = rawYieldMax;
    if (!isQuintals) {
      // If it's tonnes, convert to quintals
      yieldMinQtl *= 10;
      yieldMaxQtl *= 10;
    }
    if (!isPerAcre) {
      // If it's per hectare, multiply by hectares of the farm
      yieldMinQtl *= hectares;
      yieldMaxQtl *= hectares;
      // Sanity cap based on hectares
      yieldMinQtl = Math.min(yieldMinQtl, 150 * hectares);
      yieldMaxQtl = Math.min(yieldMaxQtl, 150 * hectares);
    } else {
      // If it's per acre, multiply by acres of the farm
      yieldMinQtl *= acres;
      yieldMaxQtl *= acres;
      yieldMinQtl = Math.min(yieldMinQtl, 60 * acres);
      yieldMaxQtl = Math.min(yieldMaxQtl, 60 * acres);
    }
    // Parse price — GPT returns "₹18,000-22,000/qtl"
    const priceStr = (crop.market_price || '₹2000-3000/qtl').toString();
    const cleanPrice = priceStr.replace(/[₹,\s]/g, '');
    const priceNums = cleanPrice.match(/[\d.]+/g);
    let priceMinQtl = priceNums ? parseFloat(priceNums[0]) : 2000;
    let priceMaxQtl = priceNums && priceNums[1] ? parseFloat(priceNums[1]) : priceMinQtl * 1.2;
    // If price looks like per kg (under 300), multiply by 100 to get per quintal
    if (priceMinQtl < 300) { priceMinQtl *= 100; priceMaxQtl *= 100; }
    // Sanity cap — no crop price above ₹2,00,000/qtl
    priceMinQtl = Math.min(priceMinQtl, 200000);
    priceMaxQtl = Math.min(priceMaxQtl, 200000);
    const incomeMin = Math.round(yieldMinQtl * priceMinQtl);
    const incomeMax = Math.round(yieldMaxQtl * priceMaxQtl);
    // Final sanity check — income per acre should be under ₹5 lakh
    const maxReasonableIncome = acres * 500000;
    const finalMin = Math.min(incomeMin, maxReasonableIncome);
    const finalMax = Math.min(incomeMax, maxReasonableIncome);
    return {
      incomeMin: finalMin,
      incomeMax: finalMax,
      yieldMinQtl: Math.round(yieldMinQtl),
      yieldMaxQtl: Math.round(yieldMaxQtl),
      hectares: hectares.toFixed(2),
    };
  } catch (e) {
    console.error('Profit calc error:', e);
    return null;
  }
};
function getProfitTier(marketPrice) {
    if (!marketPrice) return { 
      label: 'Market Varies', 
      color: '#6b7280', 
      bg: '#f3f4f6' 
    };
    const nums = marketPrice.replace(/[₹,]/g, '').match(/\d+/g);
    if (!nums || nums.length === 0) return { 
      label: 'Market Varies', 
      color: '#6b7280', 
      bg: '#f3f4f6' 
    };
    const maxPrice = Math.max(...nums.map(Number));
    if (maxPrice >= 8000) return { label: '🔥 High Profit', color: '#15803d', bg: '#dcfce7' };
    if (maxPrice >= 4000) return { label: '📈 Good Profit', color: '#92400e', bg: '#fef3c7' };
    if (maxPrice >= 2000) return { label: '📊 Moderate Profit', color: '#1e40af', bg: '#dbeafe' };
    return { label: '💡 Low Profit', color: '#6b7280', bg: '#f3f4f6' };
}
const getMatchLevel = (score) => {
  if (typeof score === 'string') {
    const lower = score.toLowerCase();
    if (lower.includes('ideal') || lower.includes('high') || lower.includes('good') || lower === '✅') return 'ideal';
    if (lower.includes('acceptable') || lower.includes('medium') || lower.includes('mid') || lower === '⚠️') return 'acceptable';
    if (lower.includes('low') || lower.includes('poor') || lower === '❌') return 'low';
  }
  let s = Number(score);
  if (isNaN(s)) return 'low';
  if (s <= 1.0 && s > 0) s = s * 100; // Handle decimal probabilities like 0.85
  
  if (s >= 75) return 'ideal';      // ✅ Ideal match
  if (s >= 50) return 'acceptable'; // ⚠️ Acceptable match
  return 'low';                      // ❌ Low match
};
const getMatchIcon = (level) => {
  if (level === 'ideal')      return '✅';
  if (level === 'acceptable') return '⚠️';
  return '❌';
};
const getMatchLabel = (level) => {
  if (level === 'ideal')      return 'Ideal';
  if (level === 'acceptable') return 'Acceptable';
  return 'Low match';
};
const getMatchColor = (level) => {
  if (level === 'ideal')      return '#166534';
  if (level === 'acceptable') return '#92400e';
  return '#b91c1c';
};
// Normalise feature_influence keys to display names
const FACTOR_LABELS = {
  'Nitrogen': 'Nitrogen',    'N': 'Nitrogen',
  'Phosphorus': 'Phosphorus','P': 'Phosphorus',
  'Potassium': 'Potassium',  'K': 'Potassium',
  'Temperature': 'Temperature', 'temp': 'Temperature',
  'Humidity': 'Humidity',    'humidity': 'Humidity',
  'Soil pH': 'Soil pH',      'pH': 'Soil pH', 'ph': 'Soil pH',
  'Rainfall': 'Rainfall',    'rainfall': 'Rainfall',
};
// Get display entries from feature_influence
const getInfluenceEntries = (feature_influence) => {
  if (!feature_influence) return [];
  return Object.entries(feature_influence).map(([key, value]) => ({
    label: FACTOR_LABELS[key] || key,
    score: value,
    level: getMatchLevel(value),
  }));
};
function SoilMatchIndicators({ influence }) {
  if (!influence) return null;
  return (
    <div style={{ marginTop: 12 }}>
      <p style={{
        fontSize: 12,
        fontWeight: 700,
        color: '#374151',
        margin: '0 0 8px',
      }}>
        🌱 How your farm matches this crop
      </p>
      {getInfluenceEntries(influence).map((factor) => (
        <div key={factor.label} style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 6
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14 }}>{getMatchIcon(factor.level)}</span>
            <span style={{ fontSize: 13, color: 'var(--color-text-primary, #374151)' }}>
              {factor.label}
            </span>
          </div>
          <span style={{
            fontSize: 12, fontWeight: 500,
            color: getMatchColor(factor.level)
          }}>
            {getMatchLabel(factor.level)}
          </span>
        </div>
      ))}
    </div>
  );
}
function getAgriculturalAlerts(formData) {
  const alerts = [];
  const N  = parseFloat(formData.N   || 0);
  const P  = parseFloat(formData.P || 0);
  const K  = parseFloat(formData.K  || 0);
  const pH = parseFloat(formData.ph         || 0);
  if (N > 120)
    alerts.push('Nitrogen is very high at ' + N +
      ' kg/ha — may cause excessive leaf growth, reduce yield');
  else if (N < 30)
    alerts.push('Nitrogen is low at ' + N +
      ' kg/ha — crops may show yellowing');
  if (P > 80)
    alerts.push('Phosphorus is high at ' + P +
      ' kg/ha — may block zinc uptake');
  else if (P < 15)
    alerts.push('Phosphorus is low at ' + P +
      ' kg/ha — crop yield may suffer');
  if (K > 160)
    alerts.push('Potassium is very high at ' + K +
      ' kg/ha — may cause salt stress in crops');
  else if (K < 15)
    alerts.push('Potassium is low at ' + K +
      ' kg/ha — affects fruit and grain quality');
  if (pH > 8.5)
    alerts.push('Soil pH is too alkaline at ' + pH +
      ' — most crops struggle above 8.5');
  else if (pH < 5.0)
    alerts.push('Soil pH is too acidic at ' + pH +
      ' — consider lime application');
  return alerts;
}
function CropLoadingState() {
  const messages = [
    '🌱 Reading your soil profile...',
    '🧪 Matching soil with crop database...',
    '🤖 AI is ranking best crops for you...',
    '📊 Calculating expected yields...',
    '💰 Fetching current market prices...',
    '✅ Almost ready...',
  ];
  const [msgIndex, setMsgIndex] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => 
        prev < messages.length - 1 ? prev + 1 : prev
      );
    }, 2500);
    return () => clearInterval(interval);
  }, []);
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #bbf7d0',
      borderRadius: 16,
      padding: '32px 24px',
      textAlign: 'center',
      margin: '20px 0',
    }}>
      <style>{`
        @keyframes rm-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{
        width: 48,
        height: 48,
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #16a34a',
        borderRadius: '50%',
        animation: 'rm-spin 0.8s linear infinite',
        margin: '0 auto 16px',
      }} />
      <h3 style={{
        fontSize: 16,
        fontWeight: 700,
        color: '#111827',
        margin: '0 0 8px',
      }}>
        Finding best crops for your farm
      </h3>
      <p style={{
        fontSize: 14,
        color: '#6b7280',
        margin: '0 0 20px',
        minHeight: 24,
        transition: 'all 0.3s ease',
      }}>
        {messages[msgIndex]}
      </p>
      <div style={{
        background: '#f3f4f6',
        borderRadius: 20,
        height: 6,
        overflow: 'hidden',
        maxWidth: 300,
        margin: '0 auto',
      }}>
        <div style={{
          background: '#16a34a',
          height: '100%',
          width: `${((msgIndex + 1) / messages.length) * 100}%`,
          borderRadius: 20,
          transition: 'width 2.5s ease',
        }} />
      </div>
      <p style={{
        fontSize: 11,
        color: '#9ca3af',
        marginTop: 12,
      }}>
        This usually takes 10–15 seconds
      </p>
    </div>
  );
}
// Helper for nutrient/climate status
function getStatus(key, value) {
    if (!value && value !== 0) return null;
    const v = parseFloat(value);
    switch(key) {
        case 'N': return v < 40 ? 'Low' : v > 250 ? 'High' : 'Good';
        case 'P': return v < 20 ? 'Low' : v > 150 ? 'High' : 'Good';
        case 'K': return v < 20 ? 'Low' : v > 250 ? 'High' : 'Good';
        case 'temperature': return v < 15 ? 'Low' : v > 35 ? 'High' : 'Good';
        case 'humidity': return v < 30 ? 'Low' : v > 80 ? 'High' : 'Good';
        case 'ph': return v < 5.5 ? 'Low' : v > 7.5 ? 'High' : 'Good';
        case 'rainfall': return v < 400 ? 'Low' : v > 1500 ? 'High' : 'Good';
        default: return 'Good';
    }
}
function StatusBadge({ status }) {
    if (!status) return null;
    const colors = {
        Good: 'var(--background-success, #dcfce7) var(--text-success, #15803d)',
        High: 'var(--background-warning, #fef3c7) var(--text-warning, #b45309)',
        Low: 'var(--background-danger, #fee2e2) var(--text-danger, #b91c1c)'
    };
    
    // Convert class string based on status
    let bgClasses = 'bg-gray-100 text-gray-700';
    if(status === 'Good') bgClasses = 'bg-green-100 text-green-700';
    if(status === 'High') bgClasses = 'bg-amber-100 text-amber-700';
    if(status === 'Low') bgClasses = 'bg-red-100 text-red-700';
    return (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${bgClasses}`}>
            {status}
        </span>
    );
}
function ProgressRing({ value, max, label, status }) {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const pct = Math.min((value || 0) / max, 1) * 100;
    const strokeDashoffset = circumference - (pct / 100) * circumference;
    const isGood = status === 'Good';
    return (
        <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90">
                    <circle cx="24" cy="24" r={radius} className="text-gray-200" strokeWidth="4" stroke="currentColor" fill="transparent" />
                    <circle cx="24" cy="24" r={radius} className={isGood ? "text-green-600" : (status === 'Low' || status === 'High' ? "text-amber-500" : "text-gray-300")} strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" stroke="currentColor" fill="transparent" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
                </svg>
                <div className="absolute flex items-center justify-center text-[10px] font-medium text-gray-700">
                    {value || 0}
                </div>
            </div>
            <span className="text-[10px] text-gray-500 mt-1 font-medium">{label}</span>
        </div>
    );
}
const getSowingStatus = (sowingWindow) => {
  if (!sowingWindow) return { label: 'Check locally', icon: '📅',
    color: '#92400e', bg: '#fffbeb' };
  const monthMap = {
    'january': 1, 'february': 2, 'march': 3, 'april': 4,
    'may': 5, 'june': 6, 'july': 7, 'august': 8,
    'september': 9, 'october': 10, 'november': 11, 'december': 12,
    'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4,
    'jun': 6, 'jul': 7, 'aug': 8, 'sep': 9,
    'oct': 10, 'nov': 11, 'dec': 12,
  };
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const text = sowingWindow.toLowerCase();
  // Extract months from sowing window string
  const foundMonths = Object.entries(monthMap)
    .filter(([name]) => text.includes(name))
    .map(([, num]) => num);
  if (foundMonths.length === 0) return {
    label: 'Plan ahead 📅', icon: '📅',
    color: '#92400e', bg: '#fffbeb'
  };
  const minMonth = Math.min(...foundMonths);
  const maxMonth = Math.max(...foundMonths);
  const monthsUntilStart = minMonth - currentMonth;
  // Currently in sowing window
  if (currentMonth >= minMonth && currentMonth <= maxMonth) {
    return { label: 'Plant now ✅', icon: '✅',
      color: '#166534', bg: '#f0fdf4' };
  }
  // Within 4 weeks (next month)
  if (monthsUntilStart === 1) {
    return { label: 'Plant soon 🌱', icon: '🌱',
      color: '#166534', bg: '#f0fdf4' };
  }
  // Within 2 months
  if (monthsUntilStart === 2) {
    return { label: 'Coming up 📆', icon: '📆',
      color: '#0369a1', bg: '#e0f2fe' };
  }
  // Far away or past season
  return { label: 'Plan ahead 📅', icon: '📅',
    color: '#92400e', bg: '#fffbeb' };
};

function CropCard({ rec, rank, crop, farmerLocation, farmAcres, formData, onReportSaved }) {
    const navigate = useNavigate();
    const [saveSuccess, setSaveSuccess] = useState(false);
    const handleSaveReport = (crop) => {
        try {
            const report = {
                id: Date.now(),
                saved_at: new Date().toISOString(),
                location: `${getFarmerDistrict() || ''}, ${getFarmerState() || ''}`,
                season: 'Summer 2026',
                farm_acres: farmAcres || 1,
                crop_name: crop.crop,
                crop_rank: rank || 1,
                confidence: crop.confidence,
                expected_yield: crop.expected_yield,
                market_price: crop.market_price,
                sowing_window: crop.sowing_window,
                why_this_crop: crop.why_this_crop,
                soil_values: {
                    N: formData.N,
                    P: formData.P,
                    K: formData.K,
                    pH: formData.ph,
                    temperature: formData.temperature,
                    humidity: formData.humidity,
                }
            };
            const existing = JSON.parse(
                localStorage.getItem('rm_crop_reports') || '[]'
            );
            existing.unshift(report);
            const trimmed = existing.slice(0, 10); // keep last 10 reports
            localStorage.setItem('rm_crop_reports', JSON.stringify(trimmed));
            if (onReportSaved) onReportSaved(trimmed);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (e) {
            console.error('Save report failed:', e);
        }
    };
    const handleShareReport = (crop) => {
        const income = calculateFarmIncome(crop, farmAcres || 1);
        const district = getFarmerDistrict() || 'your area';
        const state = getFarmerState() || '';
        const text = `🌾 Rythu Mitra Crop Report
📍 Location: ${district}, ${state}
📅 Season: Summer 2026
🏡 Farm size: ${farmAcres || 1} acre(s)
🥇 Recommended Crop: ${crop.crop}
📊 AI Confidence: ${crop.confidence}%
🌱 Sowing window: ${crop.sowing_window || 'N/A'}
📦 Expected yield: ${crop.expected_yield || 'N/A'}
💰 Market price: ${crop.market_price || 'N/A'}
${income ? `💵 Expected income: ₹${income.incomeMin.toLocaleString('en-IN')}–₹${income.incomeMax.toLocaleString('en-IN')}` : ''}
Why this crop:
${crop.why_this_crop || 'Based on your specific soil health report.'}
📱 Generated by Rythu Mitra — AI farming advisor for AP/Telangana farmers`;
        try {
            if (navigator.share) {
                navigator.share({
                    title: `Rythu Mitra — ${crop.crop} Crop Report`,
                    text,
                });
            } else {
                navigator.clipboard.writeText(text);
                alert('Report copied to clipboard ✓\nPaste it in WhatsApp or SMS to share.');
            }
        } catch (e) {
            navigator.clipboard?.writeText(text);
        }
    };
    const handleDownloadPDF = (crop) => {
        const income = calculateFarmIncome(crop, farmAcres || 1);
        const district = getFarmerDistrict() || 'N/A';
        const state = getFarmerState() || 'N/A';
        const date = new Date().toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Rythu Mitra Crop Report — ${crop.crop}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px;
                     max-width: 700px; margin: 0 auto; color: #1a1a1a; }
              .header { border-bottom: 2px solid #16a34a; padding-bottom: 16px;
                        margin-bottom: 24px; }
              .logo { font-size: 22px; font-weight: bold; color: #16a34a; }
              .subtitle { font-size: 13px; color: #666; margin-top: 4px; }
              .date { font-size: 12px; color: #888; float: right; margin-top: -30px; }
              h2 { font-size: 18px; color: #1a1a1a; margin: 20px 0 8px; }
              .section { background: #f9fafb; border-radius: 8px;
                         padding: 14px 16px; margin-bottom: 14px; }
              .row { display: flex; justify-content: space-between;
                     margin-bottom: 6px; font-size: 14px; }
              .label { color: #666; }
              .value { font-weight: 500; }
              .income { font-size: 20px; font-weight: bold;
                        color: #166534; margin: 8px 0; }
              .footer { border-top: 1px solid #e5e7eb; padding-top: 14px;
                        margin-top: 24px; font-size: 11px; color: #999; }
              .badge { display: inline-block; background: #f0fdf4;
                       color: #166534; border-radius: 12px;
                       padding: 3px 10px; font-size: 12px;
                       font-weight: 500; margin-left: 8px; }
              @media print { body { padding: 20px; } }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">🌾 Rythu Mitra</div>
              <div class="subtitle">AI-powered crop advisory for Indian farmers</div>
              <div class="date">Generated: ${date}</div>
            </div>
            <h2>Crop Recommendation Report</h2>
            <div class="section">
              <div class="row"><span class="label">Farmer location</span>
                <span class="value">${district}, ${state}</span></div>
              <div class="row"><span class="label">Farm size</span>
                <span class="value">${farmAcres || 1} acre(s)</span></div>
              <div class="row"><span class="label">Season</span>
                <span class="value">Summer 2026</span></div>
              <div class="row"><span class="label">Soil (N/P/K)</span>
                <span class="value">${formData.N} / ${formData.P} / ${formData.K} kg/ha</span></div>
            </div>
            <h2>Recommended Crop: ${crop.crop}
              <span class="badge">${crop.confidence}% AI confidence</span>
            </h2>
            <div class="section">
              <div class="row"><span class="label">Sowing window</span>
                <span class="value">${crop.sowing_window || 'N/A'}</span></div>
              <div class="row"><span class="label">Expected yield</span>
                <span class="value">${crop.expected_yield || 'N/A'}</span></div>
              <div class="row"><span class="label">Market price</span>
                <span class="value">${crop.market_price || 'N/A'}</span></div>
            </div>
            ${income ? `
            <div class="section">
              <div class="label">Expected income from ${farmAcres || 1} acre farm</div>
              <div class="income">
                ₹${income.incomeMin.toLocaleString('en-IN')} –
                ₹${income.incomeMax.toLocaleString('en-IN')}
              </div>
              <div style="font-size:12px;color:#888">
                Based on ${income.yieldMinQtl}–${income.yieldMaxQtl} quintals
                at current market price
              </div>
            </div>` : ''}
            <div class="section">
              <div class="label" style="margin-bottom:6px">
                Why this crop suits your farm
              </div>
              <div style="font-size:14px;line-height:1.6">
                ${crop.why_this_crop || 'Based on your specific soil health report.'}
              </div>
            </div>
            <div class="footer">
              This report is generated by Rythu Mitra AI and is intended as
              advisory only. Actual yields and prices may vary based on local
              conditions, weather, and market fluctuations. Please consult
              your local Krishi Vigyan Kendra (KVK) for verified guidance.
              <br><br>
              Generated by Rythu Mitra · rythu-mitra.app
            </div>
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };
    // Bilingual mappings and defaults
    const rawConf = Number(rec.confidence || 0.85);
    const confidence = rawConf < 2 ? Math.round(rawConf * 100) : Math.round(rawConf);
    const cropTe = rec.crop_te || rec.crop + " (తెలుగు)";
    const whyEn = rec.why_this_crop || rec.explanation?.why_suitable || "Optimal matches found in nutrient and climate patterns for your farm.";
    const yieldEst = rec.expected_yield || "3–4 tonnes/hectare expected";
    const profit = rec.profit_potential || "Medium Profit";
    let features = [];
    if (rec.feature_influence) {
        features = Object.entries(rec.feature_influence).map(([key, val]) => ({ name: key, importance: val }));
    } else {
        features = rec.explanation?.top_features || rec.explanation?.shap_features || [];
    }
    
    if(features.length === 0) {
        features = [
            { name: 'Temperature', importance: 0.8 },
            { name: 'Nitrogen', importance: 0.5 },
            { name: 'Soil pH', importance: 0.3 }
        ];
    }
    const marketValue = rec.market_price || rec.market_estimate || "₹2,400 - ₹2,800/qtl";
    const [realMandiPrice, setRealMandiPrice] = useState(null);
    const [mandiLoading, setMandiLoading] = useState(false);
    const [mandiSource, setMandiSource] = useState('ai');
    useEffect(() => {
      async function loadMandiPrice() {
        const district = getFarmerDistrict();
        if (!district || !crop.crop) return;
        setMandiLoading(true);
        const data = await fetchMandiPrice(
          crop.crop, 
          district
        );
        if (data) {
          setRealMandiPrice(data);
          setMandiSource('live');
        }
        setMandiLoading(false);
      }
      loadMandiPrice();
    }, [crop.crop]);
    return (
        <div className="mb-4 bg-white rounded-lg overflow-hidden flex flex-col" style={{ borderWidth: '0.5px', borderColor: '#e5e7eb' }}>
            {/* Header section */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-[28px] h-[28px] rounded flex items-center justify-center bg-green-100 text-green-800 text-sm">
                            🌾
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[15px] font-medium text-gray-900 leading-tight">{rec.crop}</span>
                            <span className="text-[11px] text-gray-500 mt-0.5">{cropTe}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-center">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-green-100 text-green-800">Rank #{rank}</span>
                        {(() => {
                            const tier = getProfitTier(marketValue);
                            return (
                            <span style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: '3px 10px',
                                borderRadius: 20,
                                color: tier.color,
                                background: tier.bg,
                            }}>
                                {tier.label}
                            </span>
                            );
                        })()}
                    </div>
                </div>
                
                <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[11px] font-medium text-gray-700">
                        <span>AI confidence</span>
                        <span>{confidence}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${confidence}%`, backgroundColor: '#166534' }}></div>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                        High probability of success based on historical data matching your soil profile.
                    </p>
                </div>
            </div>
            {/* Body section */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-4">
                    <div className="bg-gray-50 rounded-md p-3 border border-gray-100">
                        <h4 className="text-[11px] font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><span className="text-[14px]">🧠</span> Why this crop suits your farm</h4>
                        <p className="text-[12px] text-gray-800 leading-relaxed mb-2">{whyEn}</p>
                    </div>
                    {crop.sowing_window && (() => {
                      const sowing = getSowingStatus(crop.sowing_window);
                      return (
                        <div style={{
                          background: sowing.bg, borderRadius: 8,
                          padding: '10px 14px', marginTop: 10
                        }}>
                          <div style={{
                            fontSize: 13, fontWeight: 500, color: sowing.color
                          }}>
                            Sowing window: {crop.sowing_window}
                          </div>
                          <div style={{ fontSize: 12, color: sowing.color, marginTop: 3 }}>
                            {sowing.label}
                          </div>
                        </div>
                      );
                    })()}
                    {(crop.water_requirement || crop.irrigation_type) && (
                      <div style={{
                        display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap'
                      }}>
                        {crop.water_requirement && (
                          <span style={{
                            fontSize: 12, padding: '4px 10px', borderRadius: 20,
                            background: '#e0f2fe', color: '#0369a1', fontWeight: 500
                          }}>
                            💧 {crop.water_requirement}
                          </span>
                        )}
                        {crop.irrigation_type && (
                          <span style={{
                            fontSize: 12, padding: '4px 10px', borderRadius: 20,
                            background: 'var(--color-background-secondary, #f0fdf4)',
                            color: 'var(--color-text-secondary, #15803d)'
                          }}>
                            🚿 {crop.irrigation_type}
                          </span>
                        )}
                      </div>
                    )}
{(() => {
  const income = calculateFarmIncome(rec, farmAcres);
  if (!income) return null;
  return (
    <div style={{
      background: 'var(--color-background-secondary, #f0fdf4)',
      borderRadius: 12, padding: '12px 14px', marginTop: 10
    }}>
      <div style={{
        fontSize: 11, fontWeight: 600,
        color: 'var(--color-text-secondary, #15803d)',
        letterSpacing: '0.04em', marginBottom: 8
      }}>
        💰 EXPECTED INCOME FROM YOUR {farmAcres} ACRE FARM
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8
      }}>
        <div style={{
          background: 'var(--color-background-primary, #ffffff)',
          borderRadius: 8, padding: '8px 12px',
          border: '1px solid #bbf7d0'
        }}>
          <div style={{
            fontSize: 11, color: 'var(--color-text-secondary, #6b7280)',
            marginBottom: 3
          }}>Expected yield</div>
          <div style={{ fontSize: 15, fontWeight: 600,
            color: 'var(--color-text-primary, #111827)' }}>
            {income.yieldMinQtl}–{income.yieldMaxQtl} qtl
          </div>
          <div style={{ fontSize: 11,
            color: 'var(--color-text-tertiary, #6b7280)' }}>
            from {income.hectares} hectares
          </div>
        </div>
        <div style={{
          background: 'var(--color-background-primary, #ffffff)',
          borderRadius: 8, padding: '8px 12px',
          border: '1px solid #bbf7d0'
        }}>
          <div style={{
            fontSize: 11, color: 'var(--color-text-secondary, #6b7280)',
            marginBottom: 3
          }}>Expected income</div>
          <div style={{ fontSize: 15, fontWeight: 600,
            color: '#166534' }}>
            ₹{income.incomeMin.toLocaleString('en-IN')}–
            ₹{income.incomeMax.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 11,
            color: '#6b7280' }}>
            at current market price
          </div>
        </div>
      </div>
      <div style={{
        fontSize: 11, color: '#9ca3af',
        marginTop: 8, fontStyle: 'italic'
      }}>
        ⚠️ Estimate only — actual income depends on local mandi
        price, crop quality, and weather conditions
      </div>
    </div>
  );
})()}
                    <div className="bg-green-50 text-green-800 text-[12px] font-medium px-3 py-2.5 rounded-md flex items-center justify-between border border-green-100">
                        <span className="flex items-center gap-1.5"><span className="text-[14px]">⚖️</span> Expected Yield</span>
                        <span>{yieldEst}</span>
                    </div>
                </div>
                <div className="flex flex-col justify-between">
                    <div>
                        <h4 className="text-[11px] font-medium text-gray-700 mb-2.5 flex items-center gap-1.5"><span className="text-[14px]">📊</span> AI Influence Factors</h4>
                        <p style={{
                          fontSize: 11,
                          color: '#6b7280',
                          margin: '0 0 12px',
                        }}>
                          How well your soil matches each factor
                        </p>
                        <SoilMatchIndicators influence={crop.feature_influence} />
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div style={{ marginTop: 12 }}>
                            <p style={{
                              fontSize: 12,
                              color: '#6b7280',
                              margin: '0 0 4px',
                            }}>
                              Estimated market
                            </p>
                            {mandiLoading ? (
                              <p style={{ fontSize: 14, color: '#9ca3af' }}>
                                Loading live price...
                              </p>
                            ) : realMandiPrice ? (
                              <>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  flexWrap: 'wrap',
                                }}>
                                  <p style={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    color: '#111827',
                                    margin: 0,
                                  }}>
                                    ₹{Math.round(realMandiPrice.minPrice)
                                        .toLocaleString('en-IN')}
                                    –₹{Math.round(realMandiPrice.maxPrice)
                                        .toLocaleString('en-IN')}/qtl
                                  </p>
                                  <span style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    background: '#dcfce7',
                                    color: '#15803d',
                                    padding: '2px 8px',
                                    borderRadius: 20,
                                  }}>
                                    🟢 LIVE
                                  </span>
                                  {crop.price_trend && (
                                    <span style={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                      background: 
                                        crop.price_trend === 'up' 
                                          ? '#dcfce7' :
                                        crop.price_trend === 'down' 
                                          ? '#fee2e2' : '#fef3c7',
                                      color:
                                        crop.price_trend === 'up' 
                                          ? '#15803d' :
                                        crop.price_trend === 'down' 
                                          ? '#dc2626' : '#d97706',
                                      padding: '2px 8px',
                                      borderRadius: 20,
                                    }}>
                                      {crop.price_trend === 'up' 
                                        ? '↑ Rising' :
                                       crop.price_trend === 'down' 
                                        ? '↓ Falling' : '→ Stable'}
                                    </span>
                                  )}
                                </div>
                                <p style={{
                                  fontSize: 11,
                                  color: '#6b7280',
                                  margin: '4px 0 0',
                                }}>
                                  📍 {realMandiPrice.market}, 
                                  {realMandiPrice.district} • 
                                  Last updated: {realMandiPrice.date}
                                </p>
                              </>
                            ) : (
                              <>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                }}>
                                  <p style={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    color: '#111827',
                                    margin: 0,
                                  }}>
                                    {crop.market_price || marketValue}
                                  </p>
                                  {crop.price_trend && (
                                    <span style={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                      background: 
                                        crop.price_trend === 'up' 
                                          ? '#dcfce7' :
                                        crop.price_trend === 'down' 
                                          ? '#fee2e2' : '#fef3c7',
                                      color:
                                        crop.price_trend === 'up'  
                                          ? '#15803d' :
                                        crop.price_trend === 'down' 
                                          ? '#dc2626' : '#d97706',
                                      padding: '2px 8px',
                                      borderRadius: 20,
                                    }}>
                                      {crop.price_trend === 'up'   
                                        ? '↑ Rising' :
                                       crop.price_trend === 'down' 
                                        ? '↓ Falling' : '→ Stable'}
                                    </span>
                                  )}
                                </div>
                                <p style={{
                                  fontSize: 11,
                                  color: '#9ca3af',
                                  margin: '4px 0 0',
                                  fontStyle: 'italic',
                                }}>
                                  National average — 
                                  live mandi data unavailable for 
                                  your district
                                </p>
                              </>
                            )}
                        </div>
                        <div className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded text-[10px] font-medium self-start mt-3">
                            Check local mandi
                        </div>
                    </div>
                </div>
            </div>
            {/* Action Strip */}
            <div style={{
              display: 'flex',
              gap: 8,
              marginTop: 12,
              padding: '0 16px 16px 16px',
              flexWrap: 'wrap',
            }}>
              <button
                onClick={() => {
                  const msg = `How to grow ${crop.crop} in India? ` +
                    `Give me a simple cultivation guide in 5 steps ` +
                    `for a small farmer.`;
                  window.open(
                    `https://www.google.com/search?q=` +
                    encodeURIComponent(msg), '_blank'
                  );
                }}
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 8,
                  padding: '8px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#15803d',
                  cursor: 'pointer',
                  flex: 1,
                  width: '100%',
                }}
              >
                🌱 Cultivation Guide
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, padding: '0 16px' }}>
              <button
                onClick={() => handleSaveReport(crop)}
                style={{
                  flex: 1, background: saveSuccess ? '#f0fdf4' : 'transparent',
                  border: `1px solid ${saveSuccess
                    ? '#86efac' : '#d1d5db'}`,
                  borderRadius: 8, padding: '9px 12px', fontSize: 13,
                  cursor: 'pointer',
                  color: saveSuccess ? '#166534' : '#374151',
                  fontWeight: saveSuccess ? 500 : 400, transition: 'all 0.3s'
                }}
              >
                {saveSuccess ? '✅ Saved' : '💾 Save'}
              </button>
              <button
                onClick={() => handleShareReport(crop)}
                style={{
                  flex: 1, background: 'transparent',
                  border: '1px solid #d1d5db',
                  borderRadius: 8, padding: '9px 12px', fontSize: 13,
                  cursor: 'pointer', color: '#374151'
                }}
              >
                📤 Share
              </button>
              <button
                onClick={() => navigate(
                  `/market?commodity=${encodeURIComponent(crop.crop)}`
                )}
                style={{
                  flex: 1, background: '#1d4ed8', color: '#fff',
                  border: 'none', borderRadius: 8, padding: '9px 12px',
                  fontSize: 13, cursor: 'pointer', fontWeight: 500
                }}
              >
                📊 Price
              </button>
            </div>
            <div style={{
              display: 'flex', gap: 8, marginTop: 6, marginBottom: 16,
              justifyContent: 'center'
            }}>
              <button
                onClick={() => handleDownloadPDF(crop)}
                style={{
                  background: 'transparent',
                  border: '1px solid #d1d5db',
                  borderRadius: 8, padding: '7px 14px', fontSize: 12,
                  cursor: 'pointer', color: '#4b5563'
                }}
              >
                📄 Download PDF report
              </button>
            </div>
        </div>
    );
}
function WarningCard({ warning }) {
    const message = typeof warning === 'string' ? warning : warning?.message;
    const defaultEn = message || "Adverse condition detected for cultivation in your region. Consider adjusting your planning.";
    return (
        <div className="mb-4 bg-amber-50 rounded-lg p-3 flex gap-3" style={{ borderWidth: '0.5px', borderColor: '#f59e0b' }}>
            <span className="text-amber-600 flex-shrink-0 mt-0.5">⚠️</span>
            <div className="flex flex-col gap-1.5">
                <h4 className="text-[12px] font-bold text-amber-900">Agricultural Alert</h4>
                <p className="text-[12px] text-amber-800 leading-snug">{defaultEn}</p>
            </div>
        </div>
    );
}
function NextStepsCard({ fixes }) {
    // BUG 2 Fix: If it's a simple string array, we need to map it to objects
    const formattedFixes = (fixes || []).map(f => {
        if (typeof f === 'string') {
            return {
                nutrient: "Action Required",
                advice_en: f,
                advice_te: "దయచేసి ఈ సూచనను పాటించండి."
            };
        }
        return f;
    });
    const steps = formattedFixes.length > 0 ? formattedFixes : [
        { nutrient: "Nitrogen", fertilizer: "Urea", qty_per_acre: "20", advice_en: "Add 20kg Urea per acre to improve nitrogen levels.", advice_te: "నత్రజని స్థాయిలను మెరుగుపరచడానికి ఎకరాకు 20 కిలోల యూరియాను వేయండి." },
    ];
    return (
        <div className="bg-white rounded-lg p-[14px] mt-4" style={{ borderWidth: '0.5px', borderColor: '#e5e7eb' }}>
            <h3 className="text-[13px] font-medium text-gray-900 mb-3">Next steps to improve your farm</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {steps.map((fix, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-md" style={{ padding: '10px 12px' }}>
                        <span className="text-[10px] text-gray-500 block mb-1">Step {idx + 1}</span>
                        <h4 className="text-[12px] font-medium text-gray-900 mb-1">{fix.nutrient} {(fix.fertilizer ? `— ${fix.fertilizer}` : '')}</h4>
                        <p className="text-[11px] text-gray-500 leading-snug line-clamp-2">{fix.advice_en}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
export default function CropRecommendation() {
    const {
        formData, updateField, fillDistrict, recommend,
        loading, result, error, fieldErrors, districtNames,
        selectedSeason, setSelectedSeason, weatherPrefilled,
        applyRegionalDefaults, defaultsApplied, defaultsDescription
    } = useCropRecommendation();
    const farmerLocation = getSavedLocation();
    const [farmAcres, setFarmAcres] = useState('');
    const [savedReports, setSavedReports] = useState(() => {
      try {
        return JSON.parse(localStorage.getItem('rm_crop_reports') || '[]');
      } catch { return []; }
    });
    const [locationQuery, setLocationQuery] = useState(() => {
        const saved = getSavedLocation();
        return saved ? cleanLocationName(saved) : '';
    });
    const [isLocating, setIsLocating] = useState(false);
    const handleLocate = async () => {
        setIsLocating(true);
        try {
            const locData = await detectLocationFromGPS();
            saveLocation(locData);
            setLocationQuery(cleanLocationName(locData));
            const cityStr = locData.city || locData.locality || locData.sublocality || locData.district || '';
            const match = districtNames.find(d => cityStr.toLowerCase().includes(d.toLowerCase()));
            if (match) {
                fillDistrict(match);
            }
        } catch (error) {
            console.error('GPS locate failed:', error);
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    pos => setLocationQuery(`${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`),
                    () => {}
                );
            }
        } finally {
            setIsLocating(false);
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (Object.keys(fieldErrors).length > 0) {
            alert('Please fix the highlighted errors before submitting.');
            return;
        }
        const required = ['N', 'P', 'K', 'temperature', 'humidity', 'ph'];
        const missing = required.filter(f => 
            !formData[f] && formData[f] !== 0
        );
        if (missing.length > 0) {
            alert(`Please fill in: ${missing.join(', ')}`);
            return;
        }
        
        if (!formData.rainfall) {
            updateField('rainfall', 800);
        }
        recommend();
    };
    const top_crops = result?.top_crops || result?.recommendations || [];
    const fieldsMap = [
        { key: 'N', label: 'Nitrogen (N)'},
        { key: 'P', label: 'Phosphorus (P)' },
        { key: 'K', label: 'Potassium (K)' },
        { key: 'temperature', label: 'Temperature' },
        { key: 'humidity', label: 'Humidity' },
        { key: 'ph', label: 'Soil pH' },
        { key: 'rainfall', label: 'Rainfall' },
    ];
    const allStatuses = ['N', 'P', 'K', 'ph'].map(k => getStatus(k, formData[k]));
    const isReady = allStatuses.every(s => s !== null);
    const allGreen = isReady && allStatuses.every(s => s === 'Good');
    return (
        <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <SeasonBanner selectedSeason={selectedSeason} onSeasonChange={setSelectedSeason} />
            <div className="flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto px-4 py-6">
                
                {/* ── Left Column: Farm Input ───────────────────────────────── */}
                <div className="w-full lg:w-[320px] flex-shrink-0">
                    <div className="bg-white rounded-lg p-4 shadow-sm" style={{ borderWidth: '0.5px', borderColor: '#e5e7eb' }}>
                        <h2 className="text-[13px] font-medium text-gray-900 mb-4">Tell us about your farm</h2>
                        <div style={{
                          background: '#f0fdf4',
                          border: '1px dashed #16a34a',
                          borderRadius: 12,
                          padding: '14px 16px',
                          marginBottom: 16,
                        }}>
                          <p style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: '#15803d',
                            margin: '0 0 4px',
                          }}>
                            🌾 Don't know your soil values?
                          </p>
                          <p style={{
                            fontSize: 12,
                            color: '#6b7280',
                            margin: '0 0 10px',
                            lineHeight: 1.5,
                          }}>
                            No soil test? No problem. We'll use average 
                            values for your region to get you started.
                          </p>
                          <button
                            type="button"
                            onClick={applyRegionalDefaults}
                            style={{
                              background: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: 8,
                              padding: '8px 16px',
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: 'pointer',
                              width: '100%',
                            }}
                          >
                            Use my region's average soil values
                          </button>
                        </div>
                        {defaultsApplied && (
                          <div style={{
                            background: '#fffbeb',
                            border: '1px solid #fde68a',
                            borderRadius: 8,
                            padding: '8px 12px',
                            marginBottom: 12,
                            fontSize: 12,
                            color: '#92400e',
                          }}>
                            ⚠️ Using estimated values for {defaultsDescription}.
                            For accurate results, get a soil test from your
                            nearest Krishi Vigyan Kendra (KVK).
                          </div>
                        )}
                        {/* Location row */}
                        <div className="w-full flex rounded-md border mb-5" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
                            <span className="pl-3 flex items-center justify-center text-gray-500">📍</span>
                            <input 
                                type="text" 
                                placeholder="Search location or district..." 
                                value={locationQuery}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setLocationQuery(val);
                                    const match = districtNames.find(d => val.toLowerCase().includes(d.toLowerCase()));
                                    if (match) fillDistrict(match);
                                }}
                                className="w-full px-2 py-2 text-[13px] text-gray-900 bg-transparent focus:outline-none"
                            />
                            <button 
                                type="button"
                                onClick={handleLocate}
                                disabled={isLocating}
                                className="px-3 py-2 flex items-center justify-center border-l text-gray-600 hover:bg-gray-200 transition-colors"
                                style={{ borderColor: '#e5e7eb' }}
                            >
                                {isLocating ? <span className="animate-spin text-sm">⏳</span> : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                        {/* Season Row */}
                        <div className="mb-5">
                            <label className="text-[12px] text-gray-500 block mb-2 font-medium">Growing Season</label>
                            <div className="flex items-center gap-2">
                                {['Summer', 'Monsoon', 'Winter'].map((s) => {
                                    const isSelected = selectedSeason === s;
                                    const icons = { Summer: '☀️', Monsoon: '🌧️', Winter: '❄️' };
                                    return (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setSelectedSeason(s)}
                                            className={`flex-1 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                                                isSelected ? 'bg-[#166534] text-white' : 'bg-gray-50 text-gray-700'
                                            }`}
                                            style={{
                                                border: isSelected ? 'none' : '0.5px solid #e5e7eb'
                                            }}
                                        >
                                            <span className="mr-1.5">{icons[s]}</span>{s}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-[11px] text-gray-500 mt-2">
                                Showing crops suitable for {selectedSeason} in India
                            </p>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {/* Nutrients: 3-column grid */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {fieldsMap.slice(0, 3).map(({ key, label }) => (
                                    <div key={key}>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-[11px] text-gray-500">{label.split(' ')[0]}</label>
                                            <StatusBadge status={getStatus(key, formData[key])} />
                                        </div>
                                        <input
                                            type="number"
                                            min={FIELD_LIMITS[key].min}
                                            max={FIELD_LIMITS[key].max}
                                            value={formData[key]}
                                            onChange={(e) => updateField(key, e.target.value)}
                                            className="w-full px-2 py-1.5 rounded-md text-[13px] text-gray-900 bg-white border focus:outline-none focus:border-green-500"
                                            style={{ borderColor: fieldErrors[key] ? '#ef4444' : '#e5e7eb' }}
                                        />
                                        {fieldErrors[key] && (
                                            <p style={{
                                              fontSize: 11,
                                              color: '#dc2626',
                                              fontWeight: 600,
                                              margin: '2px 0 0',
                                            }}>
                                              ⚠ {fieldErrors[key]}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {/* Climate inputs: 2-column grid */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {fieldsMap.slice(3, 7).map(({ key, label }) => (
                                    <div key={key}>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-[11px] text-gray-500">{label}</label>
                                            <StatusBadge status={getStatus(key, formData[key])} />
                                        </div>
                                        <input
                                            type="number"
                                            step="any"
                                            min={FIELD_LIMITS[key].min}
                                            max={FIELD_LIMITS[key].max}
                                            value={formData[key]}
                                            onChange={(e) => updateField(key, e.target.value)}
                                            placeholder={key === 'rainfall' ? 'Optional (e.g. 800)' : ''}
                                            className="w-full px-2 py-1.5 rounded-md text-[13px] text-gray-900 bg-white border focus:outline-none focus:border-green-500"
                                            style={{ borderColor: fieldErrors[key] ? '#ef4444' : '#e5e7eb' }}
                                        />
                                        {fieldErrors[key] && (
                                            <p style={{
                                              fontSize: 11,
                                              color: '#dc2626',
                                              fontWeight: 600,
                                              margin: '2px 0 0',
                                            }}>
                                              ⚠ {fieldErrors[key]}
                                            </p>
                                        )}
                                        {key === 'rainfall' && (
                                            <p style={{
                                              fontSize: 10,
                                              color: '#9ca3af',
                                              margin: '2px 0 0',
                                            }}>
                                              Leave blank if unknown — we'll use regional average
                                            </p>
                                        )}
                                        {(key === 'temperature' || key === 'humidity') && weatherPrefilled && (
                                            <p style={{
                                                fontSize: 11,
                                                color: '#16a34a',
                                                marginTop: 4,
                                                fontWeight: 600,
                                            }}>
                                                ✓ Auto-filled from your GPS location
                                            </p>
                                        )}
                                        {key === 'rainfall' && Number(formData[key]) > 5000 && (
                                            <p className="text-[11px] mt-1 leading-tight" style={{ color: 'var(--color-text-danger, #b91c1c)' }}>
                                                Maximum 5000 mm/year. Typical Indian range is 200–3000 mm.
                                            </p>
                                        )}
                                        {key === 'rainfall' && Number(formData[key]) <= 5000 && getStatus(key, formData[key]) === 'High' && (
                                            <p className="text-[11px] text-gray-500 mt-1 leading-tight">
                                                Very high — ensure drainage channels are clear before sowing
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {/* Soil health rings */}
                            <div className="py-4 border-t border-gray-100 flex justify-between items-center px-2">
                                <ProgressRing value={formData.N} max={140} label="N" status={getStatus('N', formData.N)} />
                                <ProgressRing value={formData.P} max={145} label="P" status={getStatus('P', formData.P)} />
                                <ProgressRing value={formData.K} max={205} label="K" status={getStatus('K', formData.K)} />
                                <ProgressRing value={formData.ph} max={14} label="pH" status={getStatus('ph', formData.ph)} />
                            </div>
                            {/* Soil health summary pill / Specific Warnings */}
                            {isReady && (
                                <div className="mt-2 mb-4">
                                    {allGreen ? (
                                        <div className="px-3 py-2 rounded-md flex items-center gap-2 bg-green-50">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span className="text-[11px] text-gray-700">Excellent — all nutrients in optimal range</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {['N', 'P', 'K'].map(k => {
                                                const s = getStatus(k, formData[k]);
                                                if (s === 'High' || s === 'Low') {
                                                    const nameObj = fieldsMap.find(f => f.key === k);
                                                    const name = nameObj ? nameObj.label.split(' ')[0] : k;
                                                    const isHigh = s === 'High';
                                                    const p = formData[k];
                                                    let warningText = "";
                                                    
                                                    if (k === 'P') {
                                                        if (isHigh) {
                                                            warningText = `Phosphorus is very high (${p} kg/ha). May block zinc.`;
                                                        } else {
                                                            warningText = `Phosphorus is low (${p} kg/ha). Normal range: 20–150.`;
                                                        }
                                                    } else {
                                                        warningText = `${name} is ${isHigh ? 'very high' : 'low'} (${p} kg/ha). ${isHigh ? 'Consider reducing fertilizer input.' : 'Needs supplementation.'}`;
                                                    }
                                                    return (
                                                        <div key={k} className="px-3 py-2 rounded-md bg-amber-50 border border-amber-100 flex flex-col gap-1">
                                                            <span className="text-[12px] font-medium text-amber-800">
                                                                {warningText}
                                                            </span>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                            {error && (
                                <div className="mb-4 px-3 py-2 rounded-md bg-red-50 border border-red-100 text-[11px] text-red-600">
                                    {error}
                                </div>
                            )}
                            <div style={{
                                marginTop: 16,
                                marginBottom: 16,
                                background: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                borderRadius: 12,
                                padding: '14px 16px',
                            }}>
                                <p style={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: '#15803d',
                                    margin: '0 0 8px',
                                }}>
                                    🏡 How big is your farm?
                                </p>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                }}>
                                    <input
                                        type="number"
                                        min="0.1"
                                        max="1000"
                                        step="any"
                                        placeholder="e.g. 2"
                                        value={farmAcres}
                                        onChange={e => setFarmAcres(e.target.value)}
                                        style={{
                                            flex: 1,
                                            padding: '10px 14px',
                                            border: '1px solid #bbf7d0',
                                            borderRadius: 10,
                                            fontSize: 15,
                                            fontWeight: 700,
                                            outline: 'none',
                                            background: '#ffffff',
                                            color: '#111827',
                                        }}
                                    />
                                    <span style={{
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: '#15803d',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        Acres
                                    </span>
                                </div>
                                {farmAcres > 0 && (
                                    <p style={{
                                        fontSize: 11,
                                        color: '#6b7280',
                                        margin: '6px 0 0',
                                    }}>
                                        = {(farmAcres * 0.4047).toFixed(2)} hectares
                                    </p>
                                )}
                            </div>
                            {/* CTA button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-[10px] rounded-md text-[13px] font-medium text-white transition-opacity"
                                style={{ backgroundColor: '#166534', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                            >
                                {loading ? 'Analyzing...' : 'Find best crops for my farm'}
                            </button>
                        </form>
                    </div>
                </div>
                {/* ── Right Column: Results ─────────────────────────────────── */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-end mb-4 px-1">
                        <div>
                            <h2 className="text-[13px] font-medium text-gray-900">Top crop recommendations</h2>
                            <p className="text-[11px] text-gray-500 mt-0.5">Ranked by suitability for your farm</p>
                        </div>
                        <span className="text-[11px] text-gray-500">Season: {selectedSeason} {new Date().getFullYear()}</span>
                    </div>
                    {loading ? (
                        <CropLoadingState />
                    ) : (
                        <>
                            {top_crops.length > 0 ? (
                                <>
                                    {top_crops.map((crop, index) => (
                                        <CropCard key={crop.crop} rec={crop} crop={crop} rank={index + 1} farmerLocation={farmerLocation} farmAcres={farmAcres} formData={formData} onReportSaved={setSavedReports} />
                                    ))}
                                    
                                    {top_crops.length > 0 && top_crops.length < 3 && (
                                        <div style={{
                                            background: '#f0fdf4',
                                            border: '1px solid #bbf7d0',
                                            borderRadius: 12,
                                            padding: '14px 16px',
                                            margin: '16px 0',
                                            display: 'flex',
                                            gap: 10,
                                            alignItems: 'flex-start',
                                        }}>
                                            <span style={{ fontSize: 20 }}>🌾</span>
                                            <div>
                                                <p style={{
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    color: '#15803d',
                                                    margin: '0 0 4px',
                                                }}>
                                                    {top_crops.length} crop
                                                    {top_crops.length > 1 ? 's are' : ' is'} best 
                                                    suited for your farm this season
                                                </p>
                                                <p style={{
                                                    fontSize: 12,
                                                    color: '#6b7280',
                                                    margin: 0,
                                                    lineHeight: 1.5,
                                                }}>
                                                    These crops have the highest success 
                                                    chance for your soil. For more options, 
                                                    try getting a soil test from your 
                                                    nearest Krishi Vigyan Kendra (KVK).
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {(() => {
                                        const nextSteps = result?.soil_fix_plan;
                                        const hasValidSteps = nextSteps &&
                                            Array.isArray(nextSteps) &&
                                            nextSteps.length > 0 &&
                                            nextSteps.some(s => {
                                                if (typeof s === 'string') {
                                                    return s && s.trim() !== '' && 
                                                           s.trim().toLowerCase() !== 'step 1' &&
                                                           s.trim().length > 10;
                                                }
                                                return s && typeof s === 'object' && Object.keys(s).length > 0 && (s.nutrient || s.advice_en || s.description);
                                            });
                                        return hasValidSteps && (
                                            <div className="next-steps-section">
                                                {false && <NextStepsCard fixes={nextSteps} />}
                                            </div>
                                        );
                                    })()}
                                    {savedReports.length > 0 && (
                                      <div style={{
                                        borderTop: '1px solid #e5e7eb',
                                        paddingTop: 16, marginTop: 16, paddingBottom: 24,
                                        width: '100%'
                                      }}>
                                        <div style={{
                                          fontSize: 13, fontWeight: 500,
                                          color: '#374151', marginBottom: 10
                                        }}>
                                          📋 My Saved Reports ({savedReports.length})
                                        </div>
                                        {savedReports.map((report) => (
                                          <div key={report.id} style={{
                                            background: '#f9fafb',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: 8, padding: '10px 14px', marginBottom: 8,
                                            display: 'flex', justifyContent: 'space-between',
                                            alignItems: 'center'
                                          }}>
                                            <div>
                                              <div style={{
                                                fontSize: 13, fontWeight: 500,
                                                color: '#374151'
                                              }}>
                                                {report.crop_name}
                                              </div>
                                              <div style={{
                                                fontSize: 12, color: '#6b7280',
                                                marginTop: 2
                                              }}>
                                                {report.farm_acres} acre · {report.location} ·{' '}
                                                {new Date(report.saved_at).toLocaleDateString('en-IN')}
                                              </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                              <span style={{
                                                fontSize: 12, color: '#166534', fontWeight: 500
                                              }}>
                                                {report.confidence}% AI
                                              </span>
                                              <button
                                                onClick={() => {
                                                  const updated = savedReports.filter(r => r.id !== report.id);
                                                  setSavedReports(updated);
                                                  localStorage.setItem(
                                                    'rm_crop_reports',
                                                    JSON.stringify(updated)
                                                  );
                                                }}
                                                style={{
                                                  background: 'transparent', border: 'none',
                                                  color: '#9ca3af',
                                                  cursor: 'pointer', fontSize: 16, padding: '0 4px'
                                                }}
                                              >
                                                ×
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                        <button
                                          onClick={() => {
                                            if (window.confirm("Are you sure you want to clear all reports?")) {
                                              setSavedReports([]);
                                              localStorage.removeItem('rm_crop_reports');
                                            }
                                          }}
                                          style={{
                                            background: 'transparent',
                                            border: '1px solid #d1d5db',
                                            borderRadius: 8, padding: '7px 14px', fontSize: 12,
                                            cursor: 'pointer', color: '#4b5563',
                                            marginTop: 4
                                          }}
                                        >
                                          Clear all reports
                                        </button>
                                      </div>
                                    )}
                                </>
                            ) : (
                                !error && (
                                    <div className="p-12 text-center border-dashed border border-gray-300 rounded-lg bg-white mt-4">
                                        <div className="text-3xl mb-3">🌱</div>
                                        <p className="text-[13px] font-medium text-gray-600">
                                            Enter your farm details on the left and discover the best crops.
                                        </p>
                                    </div>
                                )
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
