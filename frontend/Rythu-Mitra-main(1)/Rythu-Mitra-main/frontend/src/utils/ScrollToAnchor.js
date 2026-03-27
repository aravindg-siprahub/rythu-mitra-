import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToAnchor() {
    const { hash } = useLocation();

    useEffect(() => {
        if (hash) {
            setTimeout(() => {
                const element = document.getElementById(hash.replace("#", ""));
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }, 100);
        } else {
            window.scrollTo(0, 0);
        }
    }, [hash]);

    return null;
}
