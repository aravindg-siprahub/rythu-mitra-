import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

const CircularGauge = ({ color, size = 80 }: { color: string; size?: number }) => {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f3f4f6" strokeWidth="6" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono font-bold text-sm text-muted-foreground/40">—</span>
      </div>
    </div>
  );
};

const models = [
  { name: 'Crop Recommendation', icon: '🌾', version: '—', gaugeColor: '#16a34a' },
  { name: 'Disease Detection', icon: '🔬', version: '—', gaugeColor: '#f59e0b' },
  { name: 'Market Predictor', icon: '📈', version: '—', gaugeColor: '#16a34a' },
  { name: 'Weather Advisory', icon: '⛅', version: '—', gaugeColor: '#0ea5e9' },
];

export default function MLModelsSection() {
  return (
    <section id="ml-models" className="space-y-6">
      <div className="farm-section-header">
        <div className="section-icon">
          <span className="text-base">🤖</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">AI Model Performance Dashboard</h2>
          <p className="text-sm text-muted-foreground">Real-time Production Metrics</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {models.map((m, i) => (
          <motion.div
            key={m.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="farm-card"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">{m.icon}</span>
              <span className="font-semibold text-sm text-foreground">{m.name}</span>
              <span className="farm-badge text-[10px] ml-auto">{m.version}</span>
            </div>

            <div className="flex items-center gap-4">
              <CircularGauge color={m.gaugeColor} />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Accuracy</span>
                  <span className="font-mono text-muted-foreground/40">—</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Precision</span>
                  <span className="font-mono text-muted-foreground/40">—</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-mono text-muted-foreground/40">Not connected</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground mt-3 pt-3 border-t border-gray-100">Connect backend for live metrics</p>
          </motion.div>
        ))}
      </div>

      {/* Performance Chart placeholder */}
      <div className="farm-card">
        <h3 className="font-semibold text-foreground mb-4">30-Day Model Accuracy Trends</h3>
        <div className="flex items-center justify-center h-[220px]">
          <div className="text-center">
            <Brain className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Chart will render with live model data</p>
          </div>
        </div>
      </div>
    </section>
  );
}
