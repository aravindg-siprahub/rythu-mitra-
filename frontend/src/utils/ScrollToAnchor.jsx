import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToAnchor — scrolls to top on route change.
 * Drop this inside <BrowserRouter> in App.js.
 */
export default function ScrollToAnchor() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) {
            // If there's a hash (anchor), scroll to that element
            const el = document.getElementById(hash.replace('#', ''));
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
                return;
            }
        }
        // Otherwise scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [pathname, hash]);

    return null;
}
