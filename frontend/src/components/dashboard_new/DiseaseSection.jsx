import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Check, AlertTriangle, Loader2, Leaf } from 'lucide-react';
import { submitDiseaseImage, getDiseaseResult } from '../../utils/apiService';

const isHealthy = (disease) =>
    !disease || disease.toLowerCase().includes('healthy') || disease.toLowerCase().includes('no disease');

const severityColor = (s) => {
    if (!s) return '#6b7280';
    const l = s.toLowerCase();
    if (l === 'low' || l === 'healthy') return '#16a34a';
    if (l === 'medium' || l === 'moderate') return '#d97706';
    return '#dc2626';
};

export default function DiseaseSection() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState('');
    const [pollCount, setPollCount] = useState(0);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setFile(f);
        setResult(null);
        setError(null);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(f);
    };

    const pollForResult = (jobId) =>
        new Promise((resolve, reject) => {
            let attempts = 0;
            const poll = setInterval(async () => {
                attempts++;
                setPollCount(attempts);
                if (attempts > 15) {
                    clearInterval(poll);
                    reject(new Error('Analysis timed out. Try again.'));
                    return;
                }
                try {
                    const res = await getDiseaseResult(jobId);
                    const { status, result: jobResult } = res.data;
                    if (status === 'completed') { clearInterval(poll); resolve(jobResult); }
                    else if (status === 'failed') { clearInterval(poll); reject(new Error('Detection failed.')); }
                } catch (err) { clearInterval(poll); reject(err); }
            }, 2000);
        });

    const handleDetect = async () => {
        if (!file) return;
        setLoading(true); setError(null); setResult(null); setPollCount(0);
        setLoadingMsg('Uploading image...');
        try {
            const submitRes = await submitDiseaseImage(file);
            if (submitRes.data.status === 'completed' && submitRes.data.result) {
                setResult(submitRes.data.result);
            } else if (submitRes.data.job_id || submitRes.data.task_id) {
                setLoadingMsg('AI is analyzing your crop...');
                const jobResult = await pollForResult(submitRes.data.job_id || submitRes.data.task_id);
                setResult(jobResult);
            } else {
                throw new Error("No result received from AI");
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Detection failed.');
        } finally {
            setLoading(false); setLoadingMsg(''); setPollCount(0);
        }
    };

    const handleReset = () => { setFile(null); setPreview(null); setResult(null); setError(null); };

    return (
        <section id="disease" className="space-y-6">
            <div className="farm-section-header">
                <div className="section-icon">
                    <Leaf className="w-[18px] h-[18px] text-primary" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-foreground tracking-tight">AI Plant Disease Detection</h2>
                    <p className="text-sm text-muted-foreground">Upload a crop photo for instant AI diagnosis</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <span className="farm-badge">38+ Diseases • ML Powered</span>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
                {/* Upload zone */}
                <div className="farm-card relative overflow-hidden">
                    <div
                        className="upload-zone"
                        style={{ position: 'relative', minHeight: 160 }}
                    >
                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-32 object-contain rounded-lg" />
                        ) : (
                            <>
                                <div className="upload-icon">🍃</div>
                                <p className="upload-title">Upload crop photo</p>
                                <p className="upload-sub">JPG, PNG up to 10MB &bull; Tap or drag to upload</p>
                            </>
                        )}
                    </div>
                    {file && !loading && (
                        <button
                            onClick={result ? handleReset : handleDetect}
                            className="btn-shine w-full mt-3 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                        >
                            {result ? '📷 Analyze Another' : '🔬 Run Detection'}
                        </button>
                    )}
                    {!file && !result && (
                        <p className="text-center text-xs text-muted-foreground mt-3">Upload a leaf or crop image above to start</p>
                    )}
                </div>

                {/* Results */}
                <div className="farm-card flex items-center justify-center min-h-[250px]">
                    {/* Idle */}
                    {!result && !loading && !error && !file && (
                        <p className="text-sm text-muted-foreground">Upload an image to see AI results</p>
                    )}
                    {!result && !loading && !error && file && (
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-2">Image ready</p>
                            <p className="text-xs text-muted-foreground">Click "Run Detection" to start analysis</p>
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="text-center">
                            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                                <Loader2 className="w-7 h-7 text-primary animate-spin" />
                            </div>
                            <p className="text-sm font-medium text-foreground">{loadingMsg}</p>
                            {pollCount > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">{pollCount * 2}s elapsed...</p>
                            )}
                            {/* Progress bar */}
                            <div style={{ height: 4, background: '#f3f4f6', borderRadius: 2, marginTop: 12, overflow: 'hidden' }}>
                                <div style={{
                                    width: `${Math.min(pollCount * 7, 90)}%`,
                                    height: '100%',
                                    background: '#16a34a',
                                    borderRadius: 2,
                                    transition: 'width 1s ease',
                                }} />
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && !loading && (
                        <div className="w-full text-center">
                            <AlertTriangle className="w-8 h-8 text-farm-danger mx-auto mb-2" />
                            <p className="text-sm font-semibold text-farm-danger">Detection Failed</p>
                            <p className="text-xs text-muted-foreground mt-1 mb-3">{error}</p>
                            <button onClick={handleReset} className="text-xs text-primary underline cursor-pointer">
                                Try Another Image
                            </button>
                        </div>
                    )}

                    {/* Real result */}
                    {result && !loading && (
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full">
                            {isHealthy(result.disease) ? (
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                                        style={{ background: 'rgba(16,185,129,0.1)' }}>
                                        <Check className="w-8 h-8 text-farm-success" />
                                    </div>
                                    <h3 className="font-bold text-farm-success text-lg">Your crop looks healthy!</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Confidence: <span className="font-mono font-semibold text-foreground">
                                            {typeof result.confidence === 'number' ? `${(result.confidence * 100).toFixed(1)}%` : '—'}
                                        </span>
                                    </p>
                                    {result.farmer_advisory && (
                                        <p className="text-xs text-muted-foreground mt-3">{result.farmer_advisory}</p>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full">
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlertTriangle className="w-5 h-5 text-farm-danger" />
                                        <h3 className="font-bold text-farm-danger">{result.disease || 'Disease Detected'}</h3>
                                        <span className="ml-auto px-2.5 py-1 rounded-full text-xs font-medium"
                                            style={{
                                                background: `${severityColor(result.severity)}18`,
                                                color: severityColor(result.severity),
                                                border: `1px solid ${severityColor(result.severity)}40`,
                                            }}>
                                            {result.severity || 'N/A'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-3">
                                        Confidence: <strong className="text-foreground font-mono">
                                            {typeof result.confidence === 'number' ? `${(result.confidence * 100).toFixed(1)}%` : '—'}
                                        </strong>
                                    </p>
                                    {result.farmer_advisory && (
                                        <div className="rounded-xl p-3 text-xs" style={{
                                            background: 'rgba(245,158,11,0.05)',
                                            border: '1px solid rgba(245,158,11,0.2)',
                                        }}>
                                            <p className="font-semibold text-foreground mb-1">Treatment Advisory:</p>
                                            <p className="text-muted-foreground">{result.farmer_advisory}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    );
}
