import React from 'react';
import { THEME } from '../../styles/theme';

/**
 * SeasonBanner — Full-width banner showing current agricultural season.
 * Auto-detects season from system date. Light theme.
 */
export default function SeasonBanner({ selectedSeason, onSeasonChange }) {
    // Specific implementation for the Crop Recommendation page based on custom seasons
    const customSeasons = {
        Summer: {
            name: 'Summer',
            months: 'March – May',
            color: '#d97706',
            bgColor: '#FFFBEB',
            icon: '☀️',
            crops: ['Sugarcane', 'Watermelon', 'Groundnut', 'Vegetables'],
        },
        Monsoon: {
            name: 'Monsoon',
            months: 'June – September',
            color: '#2563eb',
            bgColor: '#EFF6FF',
            icon: '🌧️',
            crops: ['Rice', 'Cotton', 'Maize', 'Soybean', 'Turmeric'],
        },
        Winter: {
            name: 'Winter',
            months: 'October – February',
            color: '#16a34a',
            bgColor: '#F0FDF4',
            icon: '❄️',
            crops: ['Wheat', 'Mustard', 'Chickpea', 'Barley', 'Sunflower'],
        },
    };

    let season;
    if (selectedSeason && customSeasons[selectedSeason]) {
        season = customSeasons[selectedSeason];
    } else {
        const seasonKey = THEME.getCurrentSeason();
        season = THEME.seasons[seasonKey];
    }

    return (
        <div
            className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium shadow-sm transition-colors duration-300"
            style={{
                backgroundColor: season.bgColor, // Use solid background per spec
                borderBottom: `1px solid ${season.color}33`,
            }}
        >
            {/* Left: Icon, Name, Dates */}
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
                        style={{ color: THEME.colors.textMuted }}
                    >
                        {season.months}
                    </span>
                </div>
            </div>

            {/* Center: Best crops this season */}
            <div className="hidden md:flex items-center gap-2">
                <span
                    className="text-xs font-medium"
                    style={{ color: THEME.colors.textMuted }}
                >
                    Best crops this season:
                </span>
                {season.crops.slice(0, 3).map((crop, i) => (
                    <span
                        key={i}
                        className="px-2 py-0.5 rounded-full text-xs border bg-white"
                        style={{
                            borderColor: `${season.color}66`,
                            color: season.color,
                        }}
                    >
                        {crop}
                    </span>
                ))}
            </div>

            {/* Right: Season Toggle Pills */}
            {onSeasonChange && (
                <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-gray-200 shadow-sm">
                    {['Summer', 'Monsoon', 'Winter'].map((s) => {
                        const isSelected = selectedSeason === s;
                        const icon = customSeasons[s].icon;
                        return (
                            <button
                                key={s}
                                onClick={() => onSeasonChange(s)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                                    isSelected
                                        ? 'bg-[#166534] text-white'
                                        : 'bg-transparent text-gray-600 hover:bg-gray-50'
                                }`}
                                style={{
                                    border: isSelected ? 'none' : '0.5px solid transparent',
                                }}
                            >
                                <span>{icon}</span> {s}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
