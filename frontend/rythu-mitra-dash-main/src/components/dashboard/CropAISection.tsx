import { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Download, Save, Loader2 } from 'lucide-react';

const presets = [
  { label: '🌾 Rice Profile', values: { n: 80, p: 40, k: 40, temp: 25, humidity: 80, ph: 6.5, rainfall: 200 } },
  { label: '🌿 Vegetable', values: { n: 60, p: 50, k: 50, temp: 28, humidity: 65, ph: 6.8, rainfall: 120 } },
  { label: '🌻 Oilseeds', values: { n: 40, p: 60, k: 30, temp: 30, humidity: 55, ph: 7.0, rainfall: 80 } },
];

const fields = [
  { key: 'n', label: 'Nitrogen (N) ppm', max: 140 },
  { key: 'p', label: 'Phosphorus (P) ppm', max: 145 },
  { key: 'k', label: 'Potassium (K) ppm', max: 205 },
  { key: 'temp', label: 'Temperature °C', max: 50 },
  { key: 'humidity', label: 'Humidity %', max: 100 },
  { key: 'ph', label: 'pH Level', max: 14 },
  { key: 'rainfall', label: 'Rainfall mm/year', max: 300 },
];

export default function CropAISection() {
  const [values, setValues] = useState({ n: 80, p: 40, k: 40, temp: 25, humidity: 80, ph: 6.5, rainfall: 200 });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const predict = () => {
    setLoading(true);
    setTimeout(() => {
      setResult(null);
      setLoading(false);
    }, 1500);
  };

  return (
    <section id="crop-ai" className="space-y-6">
      <div className="farm-section-header">
        <div className="section-icon">
          <Leaf className="w-[18px] h-[18px] text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">AI Crop Recommendation Engine</h2>
          <p className="text-sm text-muted-foreground">Enter your soil data — get instant AI crop suggestions</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-11 gap-5">
        {/* Input */}
        <div className="lg:col-span-6 farm-card">
          <div className="px-5 py-3 -mx-6 -mt-6 mb-6 rounded-t-[20px]" style={{
            background: 'linear-gradient(135deg, #052e16, #16a34a)',
          }}>
            <h3 className="font-semibold text-sm text-white">🌱 Your Soil Profile</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="text-xs text-muted-foreground mb-1 block font-medium">{f.label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={f.max}
                    step={f.key === 'ph' ? 0.1 : 1}
                    value={(values as any)[f.key]}
                    onChange={(e) => setValues({ ...values, [f.key]: Number(e.target.value) })}
                    className="flex-1 accent-primary h-1.5"
                    style={{ accentColor: '#16a34a' }}
                  />
                  <span className="text-sm font-mono font-semibold text-foreground w-10 text-right">
                    {(values as any)[f.key]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={predict}
            disabled={loading}
            className="btn-shine w-full mt-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '🤖'}
            {loading ? 'Analyzing...' : 'Get AI Crop Recommendation →'}
          </button>

          <div className="flex gap-2 mt-3">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => setValues(p.values)}
                className="flex-1 py-2 text-xs rounded-xl bg-secondary text-secondary-foreground hover:bg-primary/10 transition-colors font-medium"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        <div className="lg:col-span-5 farm-card flex flex-col items-center justify-center text-center">
          {!loading && (
            <div className="text-muted-foreground">
              <Leaf className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Enter soil data and click predict to see AI recommendations</p>
              <p className="text-xs text-muted-foreground/60 mt-2">Backend connection required for real predictions</p>
            </div>
          )}
          {loading && (
            <div className="animate-pulse-green w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
