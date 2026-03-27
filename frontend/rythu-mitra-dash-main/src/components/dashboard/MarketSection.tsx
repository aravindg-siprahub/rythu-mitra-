import { motion } from 'framer-motion';
import { TrendingUp, Search, BarChart3 } from 'lucide-react';

export default function MarketSection() {
  return (
    <section id="market" className="space-y-6">
      <div className="farm-section-header">
        <div className="section-icon">
          <TrendingUp className="w-[18px] h-[18px] text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Live Mandi Market Prices</h2>
          <p className="text-sm text-muted-foreground">Real-time market data from mandis across India</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input placeholder="Search crop..." className="farm-input pl-9 text-sm" />
        </div>
        <select className="farm-input w-auto text-sm">
          <option>📍 All States</option>
          <option>Telangana</option>
          <option>Andhra Pradesh</option>
        </select>
        <select className="farm-input w-auto text-sm">
          <option>📅 Today</option>
          <option>This Week</option>
        </select>
      </div>

      {/* Empty State */}
      <div className="farm-card flex flex-col items-center justify-center py-16 text-center">
        <BarChart3 className="w-12 h-12 text-muted-foreground/20 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-1">No Market Data Available</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Market prices will appear here once the backend is connected. You'll see live prices, trends, and sparkline charts for all major crops.
        </p>
      </div>

      {/* Trend Chart Placeholder */}
      <div className="farm-card">
        <h3 className="font-semibold text-foreground mb-4">30-Day Price Trend</h3>
        <div className="flex items-center justify-center h-[250px] text-muted-foreground/40">
          <p className="text-sm">Chart will render with live data</p>
        </div>
      </div>
    </section>
  );
}
