import React from 'react';

const CROP_ICONS = {
    rice: '🌾',
    wheat: '🌿',
    maize: '🌽',
    cotton: '🌱',
    sugarcane: '🎋',
    potato: '🥔',
    onion: '🧅',
    tomato: '🍅',
    chilli: '🌶️',
    turmeric: '🟡',
    soybean: '🫘',
    mango: '🥭',
    banana: '🍌',
    coconut: '🥥',
    groundnut: '🥜',
    default: '🌱',
};

const SIZE_MAP = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
};

/**
 * CropIcon — Maps crop name to emoji icon with no external image deps.
 * Crucial for fast loading on rural low-bandwidth networks.
 *
 * @param {{ cropName: string, size?: 'sm'|'md'|'lg' }} props
 */
export default function CropIcon({ cropName = '', size = 'md' }) {
    const key = cropName.toLowerCase().trim();
    const icon = CROP_ICONS[key] || CROP_ICONS.default;

    return (
        <span className={SIZE_MAP[size]} role="img" aria-label={cropName}>
            {icon}
        </span>
    );
}
