import React, { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

export default function AnimatedBrandCurve() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end end"]
    });

    const pathLength = useSpring(scrollYProgress, {
        stiffness: 80,
        damping: 40,
        restDelta: 0.001
    });

    // We define a complex path that spans the page
    return (
        <div ref={ref} className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <svg
                viewBox="0 0 1000 4000"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                        <stop offset="10%" stopColor="#3b82f6" stopOpacity="0.4" />
                        <stop offset="50%" stopColor="#ef4444" stopOpacity="0.4" />
                        <stop offset="90%" stopColor="#3b82f6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                </defs>

                <motion.path
                    d="M 500 0 
                       C 800 500, 200 1000, 500 1500 
                       C 800 2000, 200 2500, 500 3000
                       C 800 3500, 200 4000, 500 4500"
                    stroke="url(#curveGradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{ pathLength }}
                />

                {/* Secondary Glow Path */}
                <motion.path
                    d="M 500 0 
                       C 800 500, 200 1000, 500 1500 
                       C 800 2000, 200 2500, 500 3000
                       C 800 3500, 200 4000, 500 4500"
                    stroke="url(#curveGradient)"
                    strokeWidth="40"
                    strokeLinecap="round"
                    className="blur-[100px] opacity-20"
                    style={{ pathLength }}
                />
            </svg>
        </div>
    );
}
