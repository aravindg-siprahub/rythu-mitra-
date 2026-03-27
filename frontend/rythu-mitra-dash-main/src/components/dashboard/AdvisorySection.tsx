import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export default function AdvisorySection() {
  return (
    <section id="advisory" className="space-y-6">
      <div className="farm-section-header">
        <div className="section-icon">
          <span className="text-base">💬</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">AI Farming Advisory Feed</h2>
          <p className="text-sm text-muted-foreground">AI-Powered • Daily Updates</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Advisory Cards — empty state */}
        <div className="lg:col-span-3">
          <div className="farm-card flex flex-col items-center justify-center py-16 text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No Advisories Yet</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              AI-powered farming advisories will appear here once the backend is connected. Expect crop, weather, market, and pest alerts.
            </p>
          </div>
        </div>

        {/* Stats — empty state */}
        <div className="lg:col-span-2 space-y-4">
          <div className="farm-card">
            <h4 className="font-semibold text-foreground text-sm mb-3">Advisory Stats</h4>
            {[
              { label: '📊 Total Advisories Sent', value: '—' },
              { label: '😊 Farmer Satisfaction', value: '—' },
              { label: '🌐 Languages Available', value: '—' },
              { label: '📱 Avg per Farmer', value: '—' },
            ].map((s) => (
              <div key={s.label} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <span className="font-mono font-bold text-muted-foreground/40">{s.value}</span>
              </div>
            ))}
          </div>

          <div className="farm-card">
            <h4 className="font-semibold text-foreground text-sm mb-3">Advisory Categories</h4>
            <div className="flex items-center justify-center h-[180px]">
              <p className="text-sm text-muted-foreground">Chart will render with live data</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
