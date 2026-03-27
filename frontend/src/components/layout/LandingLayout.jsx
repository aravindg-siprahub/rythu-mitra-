import { Outlet } from 'react-router-dom';

/**
 * LandingLayout — minimal layout for public landing/marketing pages.
 */
export default function LandingLayout() {
    return (
        <div style={{ minHeight: '100vh' }}>
            <Outlet />
        </div>
    );
}
