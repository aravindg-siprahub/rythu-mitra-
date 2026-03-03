import React, { useState, useRef } from 'react';
import { THEME } from '../../styles/theme';
import { useDiseaseDetection } from './hooks/useDiseaseDetection';
import SeasonBanner from '../../components/ui/SeasonBanner';
import RiskBadge from '../../components/ui/RiskBadge';
import ConfidenceBar from '../../components/ui/ConfidenceBar';

// Static educational content shown while model trains
const COMMON_DISEASES = [
    {
        name: 'Rice Blast',
        symptoms: 'Diamond-shaped lesions with gray center on leaves and stems.',
        treatment: 'Apply Tricyclazole 75 WP at 0.6g/L water. Avoid excess nitrogen.',
        icon: '🌾',
    },
    {
        name: 'Cotton Bollworm',
        symptoms: 'Holes in cotton bolls, caterpillars inside, damaged lint.',
        treatment: 'Spray Chlorpyrifos or Neem-based pesticides. Install pheromone traps.',
        icon: '🌱',
    },
    {
        name: 'Powdery Mildew',
        symptoms: 'White powdery coating on leaves. Leaves curl and dry.',
        treatment: 'Spray Wettable Sulfur 80 WP or Karathane at 2ml/L water.',
        icon: '🍃',
    },
    {
        name: 'Bacterial Blight',
        symptoms: 'Water-soaked lesions turning yellow-brown at leaf edges.',
        treatment: 'Use resistant varieties. Apply Copper Oxychloride 50 WP at 3g/L.',
        icon: '🌿',
    },
    {
        name: 'Stem Borer',
        symptoms: 'Dead hearts in seedlings. Whiteheads at grain filling stage.',
        treatment: 'Insert Carbofuran 3G granules in leaf whorls at 25kg/ha.',
        icon: '🌾',
    },
];

export default function DiseaseModule() {
    const { analyzeImage, reset, loading, result, uploadedImage, modelTraining, error } = useDiseaseDetection();
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef(null);

    const handleFile = (file) => {
        if (!file) return;
        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
            alert('Only JPG and PNG images are supported.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be smaller than 5MB.');
            return;
        }
        analyzeImage(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files[0]);
    };

    return (
        <div style={{ backgroundColor: THEME.colors.background, minHeight: '100vh' }}>
            <SeasonBanner />

            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-black" style={{ color: THEME.colors.textPrimary }}>
                        🔬 Plant Disease Detection
                    </h1>
                    <p className="text-sm mt-1" style={{ color: THEME.colors.textSecondary }}>
                        Upload a photo of your plant to detect diseases
                    </p>
                </div>

                {/* ── Training Banner ──────────────────────────────── */}
                <div
                    className="rounded-xl px-4 py-3 mb-5 flex items-start gap-3"
                    style={{
                        backgroundColor: '#FEF3C7',
                        border: `1px solid ${THEME.colors.riskMedium}66`,
                    }}
                >
                    <span className="text-2xl flex-shrink-0">⚠️</span>
                    <div>
                        <p className="font-bold text-sm" style={{ color: '#92400E' }}>
                            Disease AI Model — Training in Progress
                        </p>
                        <p className="text-sm mt-0.5" style={{ color: '#78350F' }}>
                            Our plant disease detection model is currently being trained on agricultural data.
                            For urgent help, please contact your local agriculture officer (Toll-free: 1800-180-1551).
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* ── Upload Section ────────────────────────────── */}
                    <div>
                        <div
                            className="rounded-xl p-5 shadow-sm"
                            style={{ backgroundColor: THEME.colors.surface, border: `1px solid ${THEME.colors.border}` }}
                        >
                            <h2 className="font-bold text-sm mb-4" style={{ color: THEME.colors.textPrimary }}>
                                Upload Plant Photo
                            </h2>

                            {/* Drop zone */}
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => fileRef.current?.click()}
                                className="rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors"
                                style={{
                                    borderColor: dragOver ? THEME.colors.primary : THEME.colors.border,
                                    backgroundColor: dragOver ? THEME.colors.primaryXLight : '#FAFAFA',
                                }}
                            >
                                {uploadedImage ? (
                                    <img
                                        src={uploadedImage}
                                        alt="Uploaded plant"
                                        className="max-h-48 mx-auto rounded-lg object-contain"
                                    />
                                ) : (
                                    <>
                                        <span className="text-4xl block mb-3">📷</span>
                                        <p className="text-sm font-medium" style={{ color: THEME.colors.textSecondary }}>
                                            Drag & drop or click to upload
                                        </p>
                                        <p className="text-xs mt-1" style={{ color: THEME.colors.textMuted }}>
                                            JPG, PNG · Max 5MB
                                        </p>
                                    </>
                                )}
                            </div>

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
                                style={{
                                    backgroundColor: loading ? THEME.colors.primaryLight : THEME.colors.primary,
                                    opacity: loading ? 0.7 : 1,
                                }}
                            >
                                {loading ? 'Analyzing...' : '📷 Upload Image'}
                            </button>

                            {uploadedImage && !loading && (
                                <button
                                    onClick={reset}
                                    className="w-full mt-2 py-2 rounded-xl text-sm border font-medium"
                                    style={{
                                        color: THEME.colors.textSecondary,
                                        borderColor: THEME.colors.border,
                                    }}
                                >
                                    Try Another Image
                                </button>
                            )}
                        </div>

                        {/* Loading state */}
                        {loading && (
                            <div
                                className="mt-4 rounded-xl p-4 text-center"
                                style={{ backgroundColor: THEME.colors.surface, border: `1px solid ${THEME.colors.border}` }}
                            >
                                <span className="text-2xl block animate-pulse mb-2">🔬</span>
                                <p className="text-sm font-medium" style={{ color: THEME.colors.textSecondary }}>
                                    Analyzing plant image...
                                </p>
                            </div>
                        )}

                        {/* Model training message after submit */}
                        {modelTraining && (
                            <div
                                className="mt-4 rounded-xl p-4 text-center"
                                style={{ backgroundColor: '#FEF3C7', border: `1px solid ${THEME.colors.riskMedium}44` }}
                            >
                                <p className="text-sm font-bold" style={{ color: '#92400E' }}>
                                    Disease detection model is being trained.
                                </p>
                                <p className="text-sm mt-1" style={{ color: '#78350F' }}>
                                    For now, please contact your local agriculture officer.
                                </p>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div
                                className="mt-4 rounded-xl px-4 py-3 text-sm"
                                style={{ backgroundColor: '#FDEAEA', color: THEME.colors.riskHigh }}
                            >
                                {error}
                            </div>
                        )}

                        {/* Real result (when model is available) */}
                        {result && (
                            <div
                                className="mt-4 rounded-xl p-4"
                                style={{ backgroundColor: THEME.colors.surface, border: `1px solid ${THEME.colors.border}` }}
                            >
                                <h3 className="font-bold text-sm mb-3" style={{ color: THEME.colors.textPrimary }}>
                                    Analysis Result
                                </h3>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-bold text-base" style={{ color: THEME.colors.textPrimary }}>
                                        {result.disease || result.disease_name}
                                    </span>
                                    {result.severity && <RiskBadge level={result.severity === 'HIGH' ? 'High' : result.severity} />}
                                </div>
                                <ConfidenceBar confidence={result.confidence} label="Confidence" />
                                {result.farmer_advisory && (
                                    <p className="mt-3 text-sm leading-relaxed rounded-lg px-3 py-2"
                                        style={{ backgroundColor: THEME.colors.primaryXLight, color: THEME.colors.textPrimary }}>
                                        {result.farmer_advisory}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Common Diseases Reference ─────────────────── */}
                    <div>
                        <div
                            className="rounded-xl p-5 shadow-sm"
                            style={{ backgroundColor: THEME.colors.surface, border: `1px solid ${THEME.colors.border}` }}
                        >
                            <h2 className="font-bold text-sm mb-4" style={{ color: THEME.colors.textPrimary }}>
                                📚 Common Diseases in Telangana
                            </h2>
                            <div className="space-y-4">
                                {COMMON_DISEASES.map((d, i) => (
                                    <div key={i} className="border-b last:border-0 pb-3 last:pb-0" style={{ borderColor: THEME.colors.border }}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-lg">{d.icon}</span>
                                            <span className="font-bold text-sm" style={{ color: THEME.colors.textPrimary }}>
                                                {d.name}
                                            </span>
                                        </div>
                                        <p className="text-xs mb-1" style={{ color: THEME.colors.textSecondary }}>
                                            <strong>Symptoms:</strong> {d.symptoms}
                                        </p>
                                        <p className="text-xs" style={{ color: THEME.colors.primary }}>
                                            <strong>Treatment:</strong> {d.treatment}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
