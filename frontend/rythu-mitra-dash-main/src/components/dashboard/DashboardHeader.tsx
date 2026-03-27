import { Menu, Search, Bell } from 'lucide-react';

interface Props {
  onMenuClick: () => void;
}

export default function DashboardHeader({ onMenuClick }: Props) {
  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border" style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 1px 20px rgba(0,0,0,0.06)',
        height: 72,
      }}>
        <div className="flex items-center h-full px-6 gap-4">
          <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Menu className="w-5 h-5 text-foreground" />
          </button>

          <div className="hidden md:block">
            <h2 className="text-xl font-bold text-foreground tracking-tight">Dashboard</h2>
            <p className="text-[13px] text-muted-foreground">Rythu Mitra › Overview</p>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-[360px] mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search crops, markets, weather..."
                className="farm-input pl-10 py-2 text-sm rounded-[10px] bg-gray-100 border-gray-200"
              />
            </div>
          </div>

          {/* Right items */}
          <div className="flex items-center gap-3">
            <button className="relative w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Gold Announcement Strip */}
      <div className="overflow-hidden text-[13px] font-bold tracking-wide" style={{
        height: 36,
        background: 'linear-gradient(90deg, #d97706, #f59e0b, #fbbf24, #f59e0b, #d97706)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
      }}>
        <div className="animate-marquee whitespace-nowrap">
          <span className="mx-8">🌿 Rythu Mitra — AI Agriculture Platform</span>
          <span className="mx-8">🌾 Smart Crop Recommendations</span>
          <span className="mx-8">📈 Live Market Prices</span>
          <span className="mx-8">⛅ Weather Intelligence</span>
          <span className="mx-8">🔬 Disease Detection</span>
          <span className="mx-8">🌿 Rythu Mitra — AI Agriculture Platform</span>
          <span className="mx-8">🌾 Smart Crop Recommendations</span>
          <span className="mx-8">📈 Live Market Prices</span>
          <span className="mx-8">⛅ Weather Intelligence</span>
          <span className="mx-8">🔬 Disease Detection</span>
        </div>
      </div>
    </>
  );
}
