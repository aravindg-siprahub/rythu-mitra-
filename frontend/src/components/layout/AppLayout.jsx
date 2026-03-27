import { Outlet } from 'react-router-dom';
import MobileBottomNav from '../layout/MobileBottomNav';

/**
 * AppLayout — wraps all protected agriculture module pages.
 * Provides mobile bottom nav. Sidebar is on Dashboard only.
 * /crop, /disease, /market, /weather, /workers, /transport, /governance, /work, /profile, /settings
 */
export default function AppLayout() {
    return (
        <div style={{
            minHeight: '100vh',
            background: '#f5f5f0',
            fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        }}>
            {/* Module page content */}
            <div style={{ paddingBottom: 72 }}>
                <Outlet />
            </div>

            {/* Mobile bottom navigation bar */}
            <MobileBottomNav />
        </div>
    );
}
