import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { THEME } from '../../styles/theme';
import { useDiseaseDetection } from './hooks/useDiseaseDetection';
import SeasonBanner from '../../components/ui/SeasonBanner';
import { getFarmerDistrict, getFarmerState } from '../../utils/locationService';
import { supabase } from '../../config/supabaseClient';

// ── Theme shorthands ──────────────────────────────────────────────────────────
const T = THEME.colors;

// ── Colour helpers ────────────────────────────────────────────────────────────

const spreadColor = (risk) => {
    if (!risk) return T.textPrimary;
    const r = risk.toLowerCase();
    if (r.includes('very high')) return '#7f1d1d';
    if (r.includes('high'))      return '#b91c1c';
    if (r.includes('medium'))    return '#92400e';
    return '#166534';
};

const stageColor = (stage) => {
    if (!stage) return T.textPrimary;
    const s = stage.toLowerCase();
    if (s.includes('late')) return '#b91c1c';
    if (s.includes('mid'))  return '#92400e';
    return '#166534';
};

const SpreadBadge = ({ risk }) => {
    const color = spreadColor(risk);
    const bg    = risk?.toLowerCase().includes('high') ? '#fef2f2' : '#fffbeb';
    return (
        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 12, background: bg, color, fontWeight: 500 }}>
            {risk || 'Unknown'} spread risk
        </span>
    );
};

// ── Main component ────────────────────────────────────────────────────────────

const compressImage = (file) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 800;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
        else { width = Math.round(width * MAX / height); height = MAX; }
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob(resolve, 'image/jpeg', 0.75);
    };
    img.src = url;
  });
};

export default function DiseaseModule() {
    const { analyzeImage, reset, loading, result, uploadedImage, modelTraining, error } = useDiseaseDetection();
    const [dragOver, setDragOver]           = useState(false);
    const [cropName, setCropName]           = useState('Unknown');
    const [outbreakCount, setOutbreakCount] = useState(0);
    const [loadingMsg, setLoadingMsg]       = useState('Analyzing plant image...');
    const [farmAcres, setFarmAcres]         = useState('');
    const [brightnessWarning, setBrightnessWarning] = useState(false);
    const [diseaseSaveSuccess, setDiseaseSaveSuccess] = useState(false);
    const fileRef  = useRef(null);
    const navigate = useNavigate();

    const handleSaveDiseaseReport = () => {
        try {
            const report = {
                id: Date.now(),
                saved_at: new Date().toISOString(),
                crop: result?.crop,
                disease_name: result?.disease_name,
                disease_stage: result?.disease_stage,
                confidence: result?.confidence,
                spread_risk: result?.spread_risk,
                chemical: result?.chemical_treatment?.product_name,
                dosage: result?.chemical_treatment?.dosage,
                district: getFarmerDistrict() || '',
                state: getFarmerState() || '',
            };
            const existing = JSON.parse(
                localStorage.getItem('rm_disease_history') || '[]'
            );
            existing.unshift(report);
            localStorage.setItem(
                'rm_disease_history',
                JSON.stringify(existing.slice(0, 20))
            );
            setDiseaseSaveSuccess(true);
            setTimeout(() => setDiseaseSaveSuccess(false), 3000);
        } catch (e) {
            console.error('Save disease report failed:', e);
        }
    };

    const handleShareDiseaseReport = () => {
        const text = `🌿 Rythu Mitra Disease Report
📍 ${getFarmerDistrict() || ''}, ${getFarmerState() || ''}
📅 ${new Date().toLocaleDateString('en-IN')}

🦠 Disease: ${result?.disease_name}
🌱 Crop: ${result?.crop}
📊 Stage: ${result?.disease_stage} · Confidence: ${result?.confidence}%
⚠️ Spread risk: ${result?.spread_risk}

💊 Treatment: ${result?.chemical_treatment?.product_name} — ${result?.chemical_treatment?.dosage}
📋 Schedule: ${result?.chemical_treatment?.spray_schedule}
⏱️ Harvest safety: ${result?.chemical_treatment?.safety_interval_days} days after spray

🔬 How it spreads: ${result?.spread_mechanism}
💡 Next season: ${result?.prevention_tip}

📱 Detected by Rythu Mitra — AI farming advisor`;

        try {
            if (navigator.share) {
                navigator.share({
                    title: `${result?.disease_name} — Rythu Mitra Disease Report`,
                    text,
                });
            } else {
                navigator.clipboard.writeText(text);
                alert('Report copied to clipboard ✓\nPaste in WhatsApp or SMS to share.');
            }
        } catch (e) {
            navigator.clipboard?.writeText(text);
        }
    };

    const handleDownloadDiseasePDF = () => {
        const date = new Date().toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <!DOCTYPE html><html><head>
          <title>Rythu Mitra Disease Report — ${result?.disease_name}</title>
          <style>
            body{font-family:Arial,sans-serif;padding:40px;
                 max-width:700px;margin:0 auto;color:#1a1a1a}
            .header{border-bottom:2px solid #e24b4a;padding-bottom:16px;
                    margin-bottom:24px}
            .logo{font-size:22px;font-weight:bold;color:#16a34a}
            .subtitle{font-size:13px;color:#666;margin-top:4px}
            .date{font-size:12px;color:#888;float:right;margin-top:-30px}
            h2{font-size:18px;color:#1a1a1a;margin:20px 0 8px}
            .section{background:#f9fafb;border-radius:8px;
                     padding:14px 16px;margin-bottom:14px}
            .row{display:flex;justify-content:space-between;
                 margin-bottom:6px;font-size:14px}
            .label{color:#666}
            .value{font-weight:500}
            .urgent{background:#fef2f2;border-left:4px solid #e24b4a;
                    padding:12px 16px;border-radius:0 8px 8px 0;
                    margin-bottom:14px}
            .urgent-title{font-size:12px;font-weight:bold;
                          color:#b91c1c;margin-bottom:4px}
            .urgent-text{font-size:14px;color:#7f1d1d;font-weight:500}
            .step{display:flex;gap:12px;margin-bottom:10px;font-size:14px}
            .step-num{width:24px;height:24px;background:#1d4ed8;color:#fff;
                      border-radius:50%;display:flex;align-items:center;
                      justify-content:center;font-size:12px;
                      font-weight:bold;flex-shrink:0}
            .footer{border-top:1px solid #e5e7eb;padding-top:14px;
                    margin-top:24px;font-size:11px;color:#999}
            @media print{body{padding:20px}}
          </style></head><body>
          <div class="header">
            <div class="logo">🌾 Rythu Mitra</div>
            <div class="subtitle">AI Plant Disease Detection Report</div>
            <div class="date">Generated: ${date}</div>
          </div>

          <h2>Disease Detected: ${result?.disease_name}</h2>

          <div class="section">
            <div class="row"><span class="label">Crop</span>
              <span class="value">${result?.crop}</span></div>
            <div class="row"><span class="label">Scientific name</span>
              <span class="value">${result?.scientific_name || 'N/A'}</span></div>
            <div class="row"><span class="label">AI confidence</span>
              <span class="value">${result?.confidence}%</span></div>
            <div class="row"><span class="label">Disease stage</span>
              <span class="value">${result?.disease_stage}</span></div>
            <div class="row"><span class="label">Spread risk</span>
              <span class="value">${result?.spread_risk}</span></div>
            <div class="row"><span class="label">Location</span>
              <span class="value">${getFarmerDistrict() || 'N/A'}, ${getFarmerState() || ''}</span></div>
          </div>

          <div class="urgent">
            <div class="urgent-title">🔔 DO THIS IMMEDIATELY</div>
            <div class="urgent-text">
              Spray ${result?.chemical_treatment?.product_name} —
              ${result?.chemical_treatment?.dosage}
            </div>
            <div style="font-size:13px;color:#b91c1c;margin-top:6px">
              ${result?.chemical_treatment?.spray_schedule} ·
              Stop ${result?.chemical_treatment?.safety_interval_days} days before harvest
            </div>
          </div>

          <h2>Treatment Plan</h2>
          ${(result?.treatment_steps || []).map(s => `
            <div class="step">
              <div class="step-num">${s.step}</div>
              <div>
                <strong>${s.action}</strong><br>
                <span style="color:#666">${s.detail}</span>
              </div>
            </div>
          `).join('')}

          <div class="section" style="margin-top:16px">
            <div class="row"><span class="label">Harvest safety gap</span>
              <span class="value">${result?.chemical_treatment?.safety_interval_days} days after last spray</span></div>
            <div class="row"><span class="label">Monitoring frequency</span>
              <span class="value">${result?.monitoring_frequency}</span></div>
            <div class="row"><span class="label">How it spreads</span>
              <span class="value">${result?.spread_mechanism}</span></div>
          </div>

          ${result?.yield_loss_if_untreated_percent && result.yield_loss_if_untreated_percent !== 'Unknown' ? `
          <div class="section">
            <div class="row"><span class="label">Yield loss if untreated</span>
              <span class="value" style="color:#b91c1c">
                ${result.yield_loss_if_untreated_percent}%</span></div>
            <div class="row"><span class="label">Crop value at risk/acre</span>
              <span class="value" style="color:#b91c1c">
                ₹${result.estimated_crop_value_at_risk_per_acre_inr}</span></div>
            <div class="row"><span class="label">Treatment cost</span>
              <span class="value" style="color:#166534">
                ~₹${result.cost_of_treatment_inr}</span></div>
          </div>` : ''}

          ${result?.prevention_tip ? `
          <div class="section">
            <strong>Next season prevention:</strong><br>
            <span style="color:#666">${result.prevention_tip}</span>
          </div>` : ''}

          <div class="footer">
            This report is generated by Rythu Mitra AI based on visual image analysis.
            It is intended as advisory guidance only. Please consult your local
            Krishi Vigyan Kendra (KVK) or agricultural extension officer for
            confirmed diagnosis and treatment. Always follow label instructions
            when applying any pesticide or fungicide.
            <br><br>Generated by Rythu Mitra · rythu-mitra.app
          </div>
          </body></html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
    };

    // ── Rotating loading messages ──────────────────────────────────────────────
    useEffect(() => {
        if (!loading) return;
        const messages = [
            'Analyzing plant image...',
            'Identifying disease patterns...',
            'Checking treatment database...',
            'Calculating spread risk...',
            'Preparing your report...',
            'Almost ready...',
        ];
        let i = 0;
        setLoadingMsg(messages[0]);
        const interval = setInterval(() => {
            i = (i + 1) % messages.length;
            setLoadingMsg(messages[i]);
        }, 2500);
        return () => clearInterval(interval);
    }, [loading]);

    // ── Phase 4: Save detection + fetch outbreak count from Supabase ──────────
    const saveDetectionAndFetchOutbreak = async (detectionResult) => {
        try {
            const district = getFarmerDistrict() || '';
            const state    = getFarmerState()    || '';

            console.log('[Outbreak] Saving detection:', {
                crop: detectionResult.crop,
                disease_name: detectionResult.disease_name,
                district,
                state
            });

            const insertResult = await supabase.from('disease_reports').insert({
                crop:          detectionResult.crop,
                disease_name:  detectionResult.disease_name,
                disease_stage: detectionResult.disease_stage,
                spread_risk:   detectionResult.spread_risk,
                confidence:    detectionResult.confidence,
                district,
                state,
            });

            console.log('[Outbreak] Insert result:', insertResult);

            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            const { count, error } = await supabase
                .from('disease_reports')
                .select('*', { count: 'exact', head: true })
                .eq('disease_name', detectionResult.disease_name)
                .eq('district', district)
                .gte('reported_at', sevenDaysAgo);

            console.log('[Outbreak] Count:', count, 'Error:', error);
            setOutbreakCount(count || 0);
        } catch (e) {
            console.error('[Outbreak] Failed:', e);
            setOutbreakCount(0);
        }
    };

    useEffect(() => {
        if (result && result.disease_name && result.disease_name !== 'Analysis unclear') {
            saveDetectionAndFetchOutbreak(result);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [result]);

    const CROP_OPTIONS = [
        'Unknown / Other', 'Rice (Paddy)', 'Cotton', 'Chilli', 'Tomato',
        'Groundnut', 'Maize', 'Sugarcane', 'Soybean', 'Onion', 'Tobacco',
    ];

    const handleFile = async (file) => {
        if (!file) return;
        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
            alert('Only JPG and PNG images are supported.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be smaller than 5MB.');
            return;
        }
        setOutbreakCount(0);
        setBrightnessWarning(false);

        checkImageBrightness(file).then(brightness => {
            setBrightnessWarning(brightness < 65);
        });

        // Compress image to max 800px / 0.75 quality before upload
        let uploadFile = file;
        try {
            const compressed = await compressImage(file);
            uploadFile = compressed;
        } catch {
            // fallback to original if compression fails
        }

        analyzeImage(uploadFile, cropName === 'Unknown / Other' ? 'Unknown' : cropName);
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const handleReset = () => {
        reset();
        setOutbreakCount(0);
    };

    const handleSaveScan = () => {
        try {
            const history = JSON.parse(localStorage.getItem('rm_disease_history') || '[]');
            history.unshift({
                id:            Date.now(),
                disease_name:  result?.disease_name,
                crop:          result?.crop,
                confidence:    result?.confidence,
                disease_stage: result?.disease_stage,
                district:      getFarmerDistrict(),
                date:          new Date().toISOString(),
            });
            localStorage.setItem('rm_disease_history', JSON.stringify(history.slice(0, 20)));
            alert('Scan saved ✓');
        } catch (e) {
            console.error('Save scan failed:', e);
        }
    };

    const handleShareResult = async () => {
        const text = `🌿 Rythu Mitra Disease Report
Crop: ${result.crop}
Disease: ${result.disease_name} (${result.disease_stage} stage)
Confidence: ${result.confidence}%
Spread risk: ${result.spread_risk}

Treatment: ${result.chemical_treatment?.product_name} — ${result.chemical_treatment?.dosage}
Schedule: ${result.chemical_treatment?.spray_schedule}

Yield loss if untreated: ${result.yield_loss_if_untreated_percent}%
Detected via Rythu Mitra app`;

        try {
            if (navigator.share) {
                await navigator.share({ title: `${result.disease_name} — Rythu Mitra`, text });
            } else {
                await navigator.clipboard.writeText(text);
                alert('Report copied to clipboard ✓');
            }
        } catch (e) {
            console.error('Share failed:', e);
        }
    };

    const getPersonalisedImpact = () => {
        if (!farmAcres || isNaN(farmAcres) || parseFloat(farmAcres) <= 0) return null;
        try {
            const acres = parseFloat(farmAcres);

            // Parse yield loss percent range e.g. "40-70"
            const lossRange = (result.yield_loss_if_untreated_percent || '40-70').toString();
            const lossParts = lossRange.split('-').map(Number);
            const lossMin = lossParts[0] || 40;
            const lossMax = lossParts[1] || 70;

            // Parse value at risk range e.g. "18000-32000"
            const valueRange = (result.estimated_crop_value_at_risk_per_acre_inr || '18000-32000').toString();
            const valueParts = valueRange.split('-').map(Number);
            const valuePerAcreMin = valueParts[0] || 18000;
            const valuePerAcreMax = valueParts[1] || 32000;

            const totalMin = Math.round(acres * valuePerAcreMin * (lossMin / 100));
            const totalMax = Math.round(acres * valuePerAcreMax * (lossMax / 100));

            return {
                min: totalMin.toLocaleString('en-IN'),
                max: totalMax.toLocaleString('en-IN'),
                acres,
            };
        } catch {
            return null;
        }
    };

    return (
        <div style={{ backgroundColor: T.background, minHeight: '100vh' }}>
            <SeasonBanner />

            <div className="max-w-xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-black" style={{ color: T.textPrimary }}>
                        🔬 Plant Disease Detection
                    </h1>
                    <p className="text-sm mt-1" style={{ color: T.textSecondary }}>
                        Upload a photo of your plant to detect diseases
                    </p>
                </div>

                <div className="space-y-6">
                    {/* ── Upload Section ─────────────────────────────────── */}
                    <div
                        className="rounded-xl p-5 shadow-sm border"
                        style={{ backgroundColor: T.surface, borderColor: T.border }}
                    >
                        <h2 className="font-bold text-sm mb-4" style={{ color: T.textPrimary }}>
                            Upload Plant Photo
                        </h2>

                        <div className="mb-3">
                            <label className="text-xs font-semibold mb-1 block" style={{ color: T.textSecondary }}>
                                🌿 Which plant is this?
                            </label>
                            <select
                                value={cropName}
                                onChange={(e) => setCropName(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none"
                                style={{ borderColor: T.border, color: T.textPrimary, backgroundColor: T.surface }}
                            >
                                {CROP_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => fileRef.current?.click()}
                            className="rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors"
                            style={{
                                borderColor: dragOver ? T.primary : T.border,
                                backgroundColor: dragOver ? T.primaryXLight : '#FAFAFA',
                            }}
                        >
                            {uploadedImage ? (
                                <img src={uploadedImage} alt="Uploaded plant" className="max-h-48 mx-auto rounded-lg object-contain" />
                            ) : (
                                <>
                                    <span className="text-4xl block mb-3">📷</span>
                                    <p className="text-sm font-medium" style={{ color: T.textSecondary }}>
                                        Drag &amp; drop or click to upload
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: T.textMuted }}>
                                        JPG, PNG · Max 5MB
                                    </p>
                                </>
                            )}
                        </div>

                        {brightnessWarning && (
                          <div style={{
                            display: 'flex', gap: 8, alignItems: 'flex-start',
                            background: '#fffbeb', border: '0.5px solid #fcd34d',
                            borderRadius: 8, padding: '8px 12px', marginTop: 8
                          }}>
                            <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
                            <div style={{ fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
                              <strong style={{ fontWeight: 500 }}>Photo looks dark.</strong> Retake in
                              natural daylight for better accuracy. Hold phone 20–30cm from the leaf.
                            </div>
                          </div>
                        )}

                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/jpeg,image/png"
                            className="hidden"
                            onChange={(e) => handleFile(e.target.files[0])}
                        />

                        <button
                            onClick={() => fileRef.current?.click()}
                            disabled={loading}
                            className="w-full mt-4 py-3 rounded-xl font-bold text-white text-sm"
                            style={{ backgroundColor: loading ? T.primaryLight : T.primary, opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? 'Analyzing...' : '📷 Upload Image'}
                        </button>

                        {uploadedImage && !loading && !result && (
                            <button
                                onClick={handleReset}
                                className="w-full mt-2 py-2 rounded-xl text-sm border font-medium"
                                style={{ color: T.textSecondary, borderColor: T.border }}
                            >
                                Try Another Image
                            </button>
                        )}

                        <p className="text-[10px] text-gray-500 text-center mt-3 leading-tight">
                            📸 Upload a clear photo of a plant leaf or crop only
                            <br />
                            <span className="italic font-medium">Please upload only plant, leaf or crop photos</span>
                        </p>
                    </div>

                    {/* Loading state */}
                    {loading && (
                        <div
                            className="mt-4 rounded-xl p-6 text-center border"
                            style={{ backgroundColor: T.surface, borderColor: T.border }}
                        >
                            <span className="text-3xl block animate-pulse mb-3">🔬</span>
                            <p style={{ fontSize: 14, color: T.textSecondary, marginTop: 8, fontWeight: 500 }}>
                                {loadingMsg}
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div
                            className="mt-4 rounded-xl px-4 py-3 text-sm border bg-red-50"
                            style={{ color: T.riskHigh, borderColor: '#FCA5A5' }}
                        >
                            {error}
                        </div>
                    )}

                    {/* ── Result card ──────────────────────────────────── */}
                    {result && (
                        <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 32 }}>

                            {/* Disease header */}
                            <div style={{ padding: '16px 16px 0' }}>
                                <div style={{ fontSize: 20, fontWeight: 500, color: T.textPrimary }}>
                                    {result.disease_name}
                                </div>
                                <div style={{ fontSize: 12, color: T.textSecondary, marginBottom: 8 }}>
                                    {result.crop} · Detected today
                                    {result.scientific_name ? ` · ${result.scientific_name}` : ''}
                                </div>

                                {/* Confidence bar */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                    <div style={{ flex: 1, height: 6, background: T.border, borderRadius: 3, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${result.confidence}%`, background: '#16a34a', borderRadius: 3, transition: 'width 0.8s ease' }} />
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 500, color: '#15803d', whiteSpace: 'nowrap' }}>
                                        {result.confidence}% confidence
                                    </span>
                                </div>
                                <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 10 }}>
                                    Based on visual analysis of the uploaded image
                                </div>

                                {/* Stage + spread + monitoring badges */}
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                                    <span style={{
                                        fontSize: 11, padding: '3px 10px', borderRadius: 12, fontWeight: 500,
                                        background: result.disease_stage?.toLowerCase().includes('late') ? '#fef2f2'
                                                : result.disease_stage?.toLowerCase().includes('mid')  ? '#fffbeb' : '#f0fdf4',
                                        color: stageColor(result.disease_stage)
                                    }}>
                                        {result.disease_stage || 'Unknown'} stage
                                    </span>
                                    <SpreadBadge risk={result.spread_risk} />
                                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 12, background: '#e0f2fe', color: '#0369a1', fontWeight: 500 }}>
                                        Monitor {result.monitoring_frequency?.toLowerCase() || 'daily'}
                                    </span>
                                </div>
                            </div>

                            {/* What is this */}
                            <div style={{
                                borderLeft: `3px solid ${T.primary}`, padding: '10px 14px',
                                background: T.primaryXLight, borderRadius: '0 8px 8px 0',
                                margin: '0 16px 12px', fontSize: 13, lineHeight: 1.6,
                                color: T.textPrimary
                            }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: T.textSecondary, letterSpacing: '0.05em', marginBottom: 4 }}>
                                    WHAT IS THIS?
                                </div>
                                {result.plain_description}
                            </div>

                            {/* Weather urgency */}
                            {result.weather_urgency && (
                              <div style={{
                                background: result.weather_urgency.toLowerCase().includes('sufficient') ||
                                            result.weather_urgency.toLowerCase().includes('stable') ||
                                            result.weather_urgency.toLowerCase().includes('monitor')
                                            ? '#eff6ff' : '#fffbeb',
                                border: `0.5px solid ${
                                            result.weather_urgency.toLowerCase().includes('sufficient') ||
                                            result.weather_urgency.toLowerCase().includes('stable') ||
                                            result.weather_urgency.toLowerCase().includes('monitor')
                                            ? '#bfdbfe' : '#fcd34d'}`,
                                borderRadius: 12,
                                margin: '0 16px 12px',
                                padding: '10px 14px',
                                display: 'flex', gap: 10, alignItems: 'flex-start'
                              }}>
                                <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>
                                  {result.weather_urgency.toLowerCase().includes('sufficient') ||
                                   result.weather_urgency.toLowerCase().includes('stable') ||
                                   result.weather_urgency.toLowerCase().includes('monitor')
                                   ? '🌤️' : '⚠️'}
                                </span>
                                <div>
                                  <div style={{
                                    fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 3,
                                    color: result.weather_urgency.toLowerCase().includes('sufficient') ||
                                           result.weather_urgency.toLowerCase().includes('stable') ||
                                           result.weather_urgency.toLowerCase().includes('monitor')
                                           ? '#1d4ed8' : '#92400e'
                                  }}>
                                    {result.weather_urgency.toLowerCase().includes('sufficient') ||
                                     result.weather_urgency.toLowerCase().includes('stable') ||
                                     result.weather_urgency.toLowerCase().includes('monitor')
                                     ? 'WEATHER CONDITIONS' : 'WEATHER WARNING — ACT TODAY'}
                                  </div>
                                  <div style={{
                                    fontSize: 12, lineHeight: 1.55,
                                    color: result.weather_urgency.toLowerCase().includes('sufficient') ||
                                           result.weather_urgency.toLowerCase().includes('stable') ||
                                           result.weather_urgency.toLowerCase().includes('monitor')
                                           ? '#1e40af' : '#78350f'
                                  }}>
                                    {result.weather_urgency}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* DO THIS IMMEDIATELY */}
                            <div style={{
                                background: '#fef2f2', border: '0.5px solid #fca5a5', borderRadius: 12,
                                margin: '0 16px 12px', padding: '12px 14px'
                            }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: '#b91c1c', letterSpacing: '0.05em', marginBottom: 6 }}>
                                    🔔 DO THIS IMMEDIATELY
                                </div>
                                <div style={{ fontSize: 13, color: '#7f1d1d', fontWeight: 500, lineHeight: 1.5 }}>
                                    {result.chemical_treatment?.product_name && result.chemical_treatment.product_name !== 'Not determined'
                                        ? `Spray ${result.chemical_treatment.product_name} — ${result.chemical_treatment.dosage}`
                                        : result.immediate_action}
                                </div>
                                {result.chemical_treatment?.spray_schedule && result.chemical_treatment.product_name !== 'Not determined' && (
                                    <div style={{ fontSize: 12, color: '#b91c1c', marginTop: 5, lineHeight: 1.5 }}>
                                        {result.chemical_treatment.spray_schedule}
                                        {result.chemical_treatment.safety_interval_days > 0
                                            && ` · Stop ${result.chemical_treatment.safety_interval_days} days before harvest`}
                                        {result.chemical_treatment.application_tip
                                            && ` · ${result.chemical_treatment.application_tip}`}
                                    </div>
                                )}
                            </div>

                            {/* Treatment plan */}
                            <div style={{ margin: '0 16px 12px' }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: T.textSecondary, letterSpacing: '0.04em', marginBottom: 10 }}>
                                    TREATMENT PLAN
                                </div>
                                {(result.treatment_steps || []).map((s) => (
                                    <div key={s.step} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                                        <div style={{
                                            width: 22, height: 22, background: '#1d4ed8', color: '#fff',
                                            borderRadius: '50%', fontSize: 11, fontWeight: 600,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1
                                        }}>
                                            {s.step}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 500, color: T.textPrimary, lineHeight: 1.4 }}>
                                                {s.action}
                                            </div>
                                            <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.5, marginTop: 2 }}>
                                                {s.detail}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Meta grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '0 16px 12px' }}>
                                {[
                                    { label: 'Spread risk',        value: result.spread_risk || 'Unknown',  color: spreadColor(result.spread_risk) },
                                    { label: 'Disease stage',      value: result.disease_stage || 'Unknown', color: stageColor(result.disease_stage) },
                                    { label: 'Harvest safety gap', value: result.chemical_treatment?.safety_interval_days > 0
                                        ? `${result.chemical_treatment.safety_interval_days} days after spray` : 'N/A',
                                      color: T.textPrimary },
                                    { label: 'Monitor frequency',  value: result.monitoring_frequency || 'Daily', color: '#166534' },
                                ].map((m) => (
                                    <div key={m.label} style={{ background: T.primaryXLight, borderRadius: 8, padding: '10px 12px', border: `0.5px solid ${T.border}` }}>
                                        <div style={{ fontSize: 11, color: T.textSecondary, marginBottom: 4 }}>{m.label}</div>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: m.color }}>{m.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Economic impact */}
                            {result.yield_loss_if_untreated_percent && result.yield_loss_if_untreated_percent !== 'Unknown' && (
                                <div style={{
                                    background: 'var(--color-background-secondary)',
                                    border: '1px solid #fcd34d',
                                    borderRadius: 12, margin: '0 16px 12px', padding: '12px 14px'
                                }}>
                                    <div style={{
                                        fontSize: 11, fontWeight: 600,
                                        color: 'var(--color-text-secondary)',
                                        letterSpacing: '0.04em', marginBottom: 10
                                    }}>
                                        CROP IMPACT ESTIMATE
                                    </div>

                                    {/* Farm size input */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        background: 'var(--color-background-primary)',
                                        border: '0.5px solid var(--color-border-secondary)',
                                        borderRadius: 8, padding: '6px 10px', marginBottom: 10
                                    }}>
                                        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                                            My farm size:
                                        </span>
                                        <input
                                            type="number"
                                            min="0.1"
                                            max="100"
                                            step="0.5"
                                            placeholder="e.g. 2"
                                            value={farmAcres}
                                            onChange={(e) => setFarmAcres(e.target.value)}
                                            style={{
                                                flex: 1, border: 'none', outline: 'none', fontSize: 13,
                                                background: 'transparent', color: 'var(--color-text-primary)',
                                                minWidth: 0
                                            }}
                                        />
                                        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>acres</span>
                                    </div>

                                    {/* Personalised result — show only when farm size entered */}
                                    {getPersonalisedImpact() && (
                                        <div style={{
                                            background: '#fef2f2', border: '0.5px solid #fca5a5',
                                            borderRadius: 8, padding: '8px 12px', marginBottom: 10,
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                        }}>
                                            <span style={{ fontSize: 12, color: '#7f1d1d' }}>
                                                Your {getPersonalisedImpact().acres} acre farm at risk:
                                            </span>
                                            <span style={{ fontSize: 14, fontWeight: 600, color: '#b91c1c' }}>
                                                ₹{getPersonalisedImpact().min}–₹{getPersonalisedImpact().max}
                                            </span>
                                        </div>
                                    )}

                                    {/* Standard rows */}
                                    {[
                                        {
                                            label: 'Yield loss if untreated',
                                            value: `${result.yield_loss_if_untreated_percent}%`,
                                            red: true
                                        },
                                        {
                                            label: 'Crop value at risk / acre',
                                            value: `₹${result.estimated_crop_value_at_risk_per_acre_inr}`,
                                            red: true
                                        },
                                        {
                                            label: 'Cost of treatment (full course)',
                                            value: `~₹${result.cost_of_treatment_inr}`,
                                            red: false
                                        },
                                    ].map((row) => (
                                        <div key={row.label} style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            alignItems: 'center', fontSize: 13, marginBottom: 7
                                        }}>
                                            <span style={{ color: '#4b5563', fontSize: 13 }}>{row.label}</span>
                                            <span style={{ fontWeight: 500, color: row.red ? '#b91c1c' : '#166534' }}>
                                                {row.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Regional outbreak alert */}
                            {outbreakCount > 1 && (
                                <div style={{
                                    background: '#eff6ff', border: '0.5px solid #bfdbfe', borderRadius: 12,
                                    margin: '0 16px 12px', padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: 15, flexShrink: 0 }}>📍</span>
                                    <div style={{ fontSize: 12.5, color: '#1d4ed8', lineHeight: 1.5 }}>
                                        <strong style={{ fontWeight: 500 }}>{outbreakCount} farmers</strong> in {getFarmerDistrict() || 'your district'} reported{' '}
                                        {result.disease_name} in the last 7 days.{' '}
                                        {outbreakCount >= 5 ? 'District outbreak risk: High.' : 'Stay alert and monitor daily.'}
                                    </div>
                                </div>
                            )}

                            {/* Spread mechanism */}
                            {result.spread_mechanism && (
                                <div style={{ margin: '0 16px 10px', fontSize: 12, color: T.textSecondary, lineHeight: 1.55 }}>
                                    <span style={{ fontWeight: 500, color: T.textPrimary }}>How it spreads: </span>
                                    {result.spread_mechanism}
                                </div>
                            )}

                            {/* Prevention tip */}
                            {result.prevention_tip && (
                                <div style={{
                                    margin: '0 16px 14px', fontSize: 12, color: '#166534',
                                    background: '#f0fdf4', borderRadius: 8, padding: '9px 12px', lineHeight: 1.55
                                }}>
                                    💡 <span style={{ fontWeight: 500 }}>Next season: </span>{result.prevention_tip}
                                </div>
                            )}

                            {/* CTA buttons */}
                            <div style={{ padding: '4px 16px 12px' }}>
                              {/* Primary action */}
                              <button
                                onClick={() => navigate(
                                  `/market?search=${encodeURIComponent(
                                    result.chemical_treatment?.product_name || 'fungicide'
                                  )}`
                                )}
                                style={{
                                  width: '100%', background: '#1d4ed8', color: '#fff',
                                  border: 'none', borderRadius: 8, padding: '11px 12px',
                                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                                  marginBottom: 8
                                }}
                              >
                                Find {result.chemical_treatment?.product_name?.split(' ')[0] || 'treatment'} nearby →
                              </button>

                              {/* Secondary actions row */}
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                  onClick={handleSaveDiseaseReport}
                                  style={{
                                    flex: 1,
                                    background: diseaseSaveSuccess ? '#f0fdf4' : 'transparent',
                                    border: `0.5px solid ${diseaseSaveSuccess
                                      ? '#86efac' : '#cbd5e1'}`,
                                    borderRadius: 8, padding: '9px 8px', fontSize: 12,
                                    cursor: 'pointer',
                                    color: diseaseSaveSuccess ? '#166534' : '#374151',
                                    fontWeight: diseaseSaveSuccess ? 500 : 400,
                                    transition: 'all 0.3s'
                                  }}
                                >
                                  {diseaseSaveSuccess ? '✅ Saved' : '💾 Save'}
                                </button>
                                <button
                                  onClick={handleShareDiseaseReport}
                                  style={{
                                    flex: 1, background: 'transparent',
                                    border: '0.5px solid #cbd5e1',
                                    borderRadius: 8, padding: '9px 8px', fontSize: 12,
                                    cursor: 'pointer', color: '#374151'
                                  }}
                                >
                                  📤 Share
                                </button>
                                <button
                                  onClick={handleDownloadDiseasePDF}
                                  style={{
                                    flex: 1, background: 'transparent',
                                    border: '0.5px solid #cbd5e1',
                                    borderRadius: 8, padding: '9px 8px', fontSize: 12,
                                    cursor: 'pointer', color: '#374151'
                                  }}
                                >
                                  📄 PDF
                                </button>
                              </div>
                            </div>

                            {/* Try another image */}
                            <div style={{ borderTop: `0.5px solid ${T.border}`, margin: '8px 16px 0', paddingTop: 16 }}>
                                <p style={{ fontSize: 13, color: T.textSecondary, marginBottom: 10, textAlign: 'center' }}>
                                    Not what you expected?
                                </p>
                                <div className="space-y-2">
                                    <div>
                                        <label className="text-[11px] font-medium block mb-1" style={{ color: T.textSecondary }}>Scan a different plant</label>
                                        <select
                                            value={cropName}
                                            onChange={(e) => setCropName(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg text-[13px] border focus:outline-none"
                                            style={{ borderColor: T.border, color: T.textPrimary, backgroundColor: T.surface }}
                                        >
                                            {CROP_OPTIONS.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        onClick={handleReset}
                                        style={{
                                            width: '100%', padding: '9px', border: `0.5px solid ${T.border}`,
                                            borderRadius: 8, background: 'transparent', fontSize: 13,
                                            cursor: 'pointer', color: T.textPrimary
                                        }}
                                    >
                                        Try another image
                                    </button>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


const checkImageBrightness = (file) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      // Sample at small size for speed
      canvas.width = 50;
      canvas.height = 50;
      ctx.drawImage(img, 0, 0, 50, 50);
      URL.revokeObjectURL(url);
      const data = ctx.getImageData(0, 0, 50, 50).data;
      let total = 0;
      for (let i = 0; i < data.length; i += 4) {
        // Perceived brightness formula
        total += (data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114);
      }
      const avg = total / (50 * 50);
      resolve(avg); // 0-255, below 60 = very dark
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(128); };
    img.src = url;
  });
};
