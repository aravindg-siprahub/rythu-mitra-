import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  BarChart3, Leaf, Bug, TrendingUp, Cloud, Users, Truck, Brain,
  MessageCircle, Settings, Wifi, HelpCircle
} from 'lucide-react';

const mainNav = [
  { icon: BarChart3, label: 'Overview', id: 'overview', active: true },
  { icon: Leaf, label: 'Crop AI', id: 'crop-ai' },
  { icon: Bug, label: 'Disease Detection', id: 'disease' },
  { icon: TrendingUp, label: 'Market Prices', id: 'market' },
  { icon: Cloud, label: 'Weather', id: 'weather' },
  { icon: Users, label: 'Workers', id: 'services' },
  { icon: Truck, label: 'Transport', id: 'services' },
  { icon: Brain, label: 'ML Models', id: 'ml-models' },
  { icon: MessageCircle, label: 'AI Advisory', id: 'advisory' },
  { icon: Users, label: 'Community', id: 'community' },
];

const accountNav = [
  { icon: Settings, label: 'Settings', id: 'settings' },
  { icon: HelpCircle, label: 'Help', id: 'help' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

const SidebarBody = ({ onNavigate }: { onNavigate?: () => void }) => (
  <div className="h-full flex flex-col sidebar-scroll" style={{
    background: 'linear-gradient(180deg, #052e16 0%, #0a3d1f 100%)',
    borderRight: '1px solid rgba(255,255,255,0.06)',
  }}>
    {/* Brand */}
    <div className="p-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
          background: 'rgba(34,197,94,0.15)',
          border: '1px solid rgba(34,197,94,0.2)',
        }}>
          <Leaf className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h1 className="font-bold text-white text-lg leading-tight tracking-tight">Rythu Mitra</h1>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>AI Farmer Intelligence</p>
        </div>
      </div>
    </div>

    <div className="mx-6 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />

    {/* Main Menu */}
    <div className="px-6 pt-5 pb-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
        Main Menu
      </p>
    </div>
    <nav className="flex-1 overflow-y-auto sidebar-scroll px-3">
      <div className="space-y-0.5">
        {mainNav.map((item) => (
          <button
            key={item.label}
            onClick={() => { scrollTo(item.id); onNavigate?.(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group"
            style={item.active ? {
              background: 'rgba(34,197,94,0.15)',
              border: '1px solid rgba(34,197,94,0.2)',
            } : {
              border: '1px solid transparent',
            }}
          >
            <item.icon className="w-[18px] h-[18px] flex-shrink-0" style={{
              color: item.active ? '#22c55e' : 'rgba(255,255,255,0.5)',
            }} />
            <span style={{
              color: item.active ? '#ffffff' : 'rgba(255,255,255,0.6)',
              fontWeight: item.active ? 600 : 400,
            }}>{item.label}</span>
            {item.active && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400" />
            )}
          </button>
        ))}
      </div>

      {/* Account */}
      <div className="px-3 pt-5 pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Account
        </p>
      </div>
      <div className="space-y-0.5">
        {accountNav.map((item) => (
          <button
            key={item.label}
            onClick={() => onNavigate?.()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
            style={{ border: '1px solid transparent' }}
          >
            <item.icon className="w-[18px] h-[18px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }} />
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>

    {/* Bottom Status */}
    <div className="p-4">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs" style={{
        background: 'rgba(16,185,129,0.1)',
        border: '1px solid rgba(16,185,129,0.2)',
        color: 'rgba(255,255,255,0.6)',
      }}>
        <span className="w-2 h-2 rounded-full animate-pulse-green" style={{ background: '#10b981' }} />
        <span>All Systems Operational</span>
      </div>
    </div>
  </div>
);

export default function DashboardSidebar({ open, onClose }: Props) {
  return (
    <>
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-[280px] z-40" style={{
        boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
      }}>
        <SidebarBody />
      </aside>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="left" className="p-0 w-[280px] border-0">
          <SidebarBody onNavigate={onClose} />
        </SheetContent>
      </Sheet>
    </>
  );
}
