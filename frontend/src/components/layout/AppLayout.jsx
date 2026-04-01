import { Outlet } from 'react-router-dom';
import DashboardHeader from '../dashboard_new/DashboardHeader';

/**
 * AppLayout — wraps all protected agriculture module pages.
 * Provides: green top bar + pill nav (DashboardHeader) + mobile bottom nav.
 * /dashboard, /crop, /disease, /market, /weather, /work, /profile, /settings, /booking
 */
export default function AppLayout() {
    return (
        <div style={{
            minHeight: '100vh',
            background: '#f5f5f0',
            fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        }}>
            {/* Green header + pill nav — global across all authenticated pages */}
            <DashboardHeader />

            {/* Module page content — pb-16 clears mobile bottom nav */}
            <div style={{ paddingBottom: 80 }}>
                <Outlet />
            </div>

        </div>
    );
}
