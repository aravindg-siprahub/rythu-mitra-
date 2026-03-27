export const ANIMATIONS = {
    // Page Transitions
    page: {
        initial: { opacity: 0, scale: 0.98, filter: "blur(10px)" },
        animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
        exit: { opacity: 0, scale: 1.02, filter: "blur(10px)" },
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },

    // Stagger Container
    container: {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
            },
        },
    },

    // List Items
    item: {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        },
    },

    // Hover Effects
    hoverScale: {
        scale: 1.02,
        transition: { duration: 0.2 },
    },

    hoverGlow: {
        boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)",
        borderColor: "rgba(59, 130, 246, 0.6)",
    },
};
