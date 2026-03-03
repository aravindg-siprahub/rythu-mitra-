import React from 'react';
import { THEME } from '../../styles/theme';

/**
 * SeasonBanner — Full-width banner showing current agricultural season.
 * Auto-detects season from system date. Light theme.
 */
export default function SeasonBanner() {
    const seasonKey = THEME.getCurrentSeason();
    const season = THEME.seasons[seasonKey];

    return (
        <div
            className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium shadow-sm"
            style={{
                background: `linear-gradient(135deg, ${season.bgColor} 0%, #fff 100%)`,
                borderBottom: `2px solid ${season.color}22`,
                animation: 'seasonFade 0.6s ease-in-out',
            }}
        >
            <div className="flex items-center gap-3">
                <span className="text-2xl" role="img" aria-label={season.name}>
                    {season.icon}
                </span>
                <div>
                    <span
                        className="font-bold text-sm"
                        style={{ color: season.color }}
                    >
                        {season.name}
                    </span>
                    <span
                        className="ml-2 text-xs font-normal"
                        style={{ color: THEME.colors.textSecondary }}
                    >
                        {season.months}
                    </span>
                </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
                <span
                    className="text-xs font-medium"
                    style={{ color: THEME.colors.textMuted }}
                >
                    Best crops:
                </span>
                {season.crops.map((crop, i) => (
                    <span
                        key={i}
                        className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                            backgroundColor: `${season.color}18`,
                            color: season.color,
                        }}
                    >
                        {crop}
                    </span>
                ))}
            </div>

            <style>{`
        @keyframes seasonFade {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
