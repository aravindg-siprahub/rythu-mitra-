import { useState } from 'react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import OverviewSection from '@/components/dashboard/OverviewSection';
import CropAISection from '@/components/dashboard/CropAISection';
import DiseaseSection from '@/components/dashboard/DiseaseSection';
import MarketSection from '@/components/dashboard/MarketSection';
import WeatherSection from '@/components/dashboard/WeatherSection';
import ServicesSection from '@/components/dashboard/ServicesSection';
import CommunitySection from '@/components/dashboard/CommunitySection';
import MLModelsSection from '@/components/dashboard/MLModelsSection';
import AdvisorySection from '@/components/dashboard/AdvisorySection';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-[280px]">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 md:p-6 lg:p-8 space-y-8 pb-24 max-w-[1400px]">
          <OverviewSection />
          <CropAISection />
          <DiseaseSection />
          <MarketSection />
          <WeatherSection />
          <ServicesSection />
          <CommunitySection />
          <MLModelsSection />
          <AdvisorySection />
        </main>

        {/* Mobile Bottom Navigation — no profile duplicate */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200" style={{
          boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
          height: 64,
        }}>
          <div className="flex items-center justify-around h-full px-2">
            {[
              { icon: '📊', label: 'Home', id: 'overview', active: true },
              { icon: '🌾', label: 'Crops', id: 'crop-ai' },
              { icon: '🔬', label: 'Disease', id: 'disease' },
              { icon: '📈', label: 'Market', id: 'market' },
              { icon: '👷', label: 'Workers', id: 'services' },
              { icon: '⛅', label: 'Weather', id: 'weather' },
              { icon: '🚛', label: 'Transport', id: 'services' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
                className="flex flex-col items-center gap-0.5 py-1"
              >
                {item.active && <span className="w-1 h-1 rounded-full bg-primary mb-0.5" />}
                <span className="text-lg">{item.icon}</span>
                <span className={`text-[10px] font-medium ${item.active ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
