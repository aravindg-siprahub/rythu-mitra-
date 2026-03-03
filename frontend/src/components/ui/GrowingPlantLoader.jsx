import React, { useEffect, useState } from 'react';
import { THEME } from '../../styles/theme';

const MESSAGES = [
    'Analyzing your soil...',
    'Checking rainfall patterns...',
    'Comparing 22 crop varieties...',
    'Calculating risk factors...',
    'Preparing your recommendations...',
];

/**
 * GrowingPlantLoader — CSS-only animated plant loader.
 * Shown during API calls. No Lottie or external libraries.
 * Messages rotate every 1.5 seconds.
 */
export default function GrowingPlantLoader() {
    const [msgIdx, setMsgIdx] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMsgIdx((prev) => (prev + 1) % MESSAGES.length);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div
            className="flex flex-col items-center justify-center h-48 rounded-xl border"
            style={{
                backgroundColor: THEME.colors.surface,
                borderColor: THEME.colors.border,
            }}
        >
            <div
                className="relative h-24 flex items-end justify-center"
                style={{ width: 80 }}
            >
                {/* Seed */}
                <span
                    className="text-4xl absolute"
                    style={{
                        bottom: 0,
                        animation: 'plantGrow 2s ease-in-out infinite alternate',
                    }}
                >
                    🌱
                </span>
                {/* Bloom */}
                <span
                    className="text-4xl absolute"
                    style={{
                        bottom: 0,
                        opacity: 0,
                        animation: 'plantBloom 2s ease-in-out infinite alternate',
                    }}
                >
                    🌿
                </span>
            </div>

            <p
                className="mt-4 text-sm font-medium text-center px-4"
                style={{
                    color: THEME.colors.textSecondary,
                    minHeight: 20,
                    transition: 'opacity 0.4s',
                }}
            >
                {MESSAGES[msgIdx]}
            </p>

            <style>{`
        @keyframes plantGrow {
          0%   { transform: scale(0.8) translateY(0px); opacity: 1; }
          50%  { transform: scale(1.1) translateY(-8px); opacity: 0.7; }
          100% { transform: scale(1.3) translateY(-16px); opacity: 0; }
        }
        @keyframes plantBloom {
          0%   { opacity: 0; transform: scale(1) translateY(-16px); }
          50%  { opacity: 0.5; transform: scale(1.1) translateY(-10px); }
          100% { opacity: 1; transform: scale(1.2) translateY(-20px); }
        }
      `}</style>
        </div>
    );
}
