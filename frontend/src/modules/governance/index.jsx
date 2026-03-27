import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SCHEME_CATEGORIES = [
    { key: 'all',           label: 'All Schemes',       emoji: '🏛️' },
    { key: 'financial',     label: 'Financial Aid',      emoji: '💰' },
    { key: 'insurance',     label: 'Crop Insurance',     emoji: '🛡️' },
    { key: 'input',         label: 'Input Subsidies',    emoji: '🌱' },
    { key: 'technology',    label: 'Technology',         emoji: '📱' },
    { key: 'marketing',     label: 'Marketing Support',  emoji: '📊' },
];

const SCHEMES = [
    {
        id: 1, category: 'financial',
        name: 'PM-KISAN',
        fullName: 'Pradhan Mantri Kisan Samman Nidhi',
        benefit: '₹6,000/year direct income support',
        description: 'Direct income support of ₹6,000 per year in three equal installments of ₹2,000 each to farmer families.',
        eligibility: 'Small & marginal farmers with landholding up to 2 hectares',
        deadline: 'Ongoing',
        emoji: '💰',
        color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0',
        applyUrl: 'https://pmkisan.gov.in',
    },
    {
        id: 2, category: 'insurance',
        name: 'PMFBY',
        fullName: 'Pradhan Mantri Fasal Bima Yojana',
        benefit: 'Crop insurance at 1.5-5% premium',
        description: 'Comprehensive risk coverage and financial support to farmers suffering crop loss due to unforeseen events.',
        eligibility: 'All farmers growing notified crops in notified areas',
        deadline: 'Before sowing / 2 weeks after sowing',
        emoji: '🛡️',
        color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe',
        applyUrl: 'https://pmfby.gov.in',
    },
    {
        id: 3, category: 'input',
        name: 'DBT Fertilisers',
        fullName: 'Fertiliser Subsidy via Direct Benefit Transfer',
        benefit: 'Up to 65% subsidy on fertilisers',
        description: 'Subsidised fertilisers at fixed MRP directly to farmers through Point of Sale machines using Aadhaar.',
        eligibility: 'All registered farmers with Aadhaar-linked bank account',
        deadline: 'Ongoing',
        emoji: '🌱',
        color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0',
        applyUrl: 'https://dbtbharat.gov.in',
    },
    {
        id: 4, category: 'financial',
        name: 'KCC',
        fullName: 'Kisan Credit Card',
        benefit: 'Credit up to ₹3 lakh at 4% interest',
        description: 'Easy credit access for farmers to meet farming expenses, post-harvest expenses and maintenance of farm assets.',
        eligibility: 'All farmers, sharecroppers, tenant farmers',
        deadline: 'Ongoing',
        emoji: '💳',
        color: '#d97706', bg: '#fffbeb', border: '#fcd34d',
        applyUrl: 'https://www.nabard.org',
    },
    {
        id: 5, category: 'marketing',
        name: 'eNAM',
        fullName: 'Electronic National Agriculture Market',
        benefit: 'Competitive prices for produce',
        description: 'Online trading platform for agricultural commodities to create a unified national market for farmers.',
        eligibility: 'Farmers with produce to sell; registration through nearest APMC',
        deadline: 'Ongoing',
        emoji: '📊',
        color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe',
        applyUrl: 'https://enam.gov.in',
    },
    {
        id: 6, category: 'technology',
        name: 'PMKSK',
        fullName: 'PM Kisan Sampada Yojana',
        benefit: 'Post-harvest infrastructure grants',
        description: 'Mega food parks, cold chain logistics, food processing units to reduce wastage and add value to produce.',
        eligibility: 'Farmer Producer Organisations, cooperatives, companies',
        deadline: 'Project-specific deadlines',
        emoji: '🏭',
        color: '#065f46', bg: '#ecfdf5', border: '#a7f3d0',
        applyUrl: 'https://mofpi.gov.in',
    },
    {
        id: 7, category: 'input',
        name: 'SMAM',
        fullName: 'Sub Mission on Agricultural Mechanisation',
        benefit: '40-50% subsidy on farm equipment',
        description: 'Financial assistance on purchase of agricultural machinery and equipment to reduce cost of production.',
        eligibility: 'Individual farmers, SHGs, cooperatives and FPOs',
        deadline: 'State-specific; check your state portal',
        emoji: '🚜',
        color: '#b45309', bg: '#fffbeb', border: '#fde68a',
        applyUrl: 'https://agrimachinery.nic.in',
    },
    {
        id: 8, category: 'financial',
        name: 'PMASA',
        fullName: 'PM Annadata Aay SanraksHan Abhiyan',
        benefit: 'Price support for below-MSP sales',
        description: 'Protects farmers from distress sale when market prices fall below MSP through price support and procurement.',
        eligibility: 'All farmers; state-specific registration required',
        deadline: 'Harvest season; check state notifications',
        emoji: '🌾',
        color: '#166534', bg: '#f0fdf4', border: '#86efac',
        applyUrl: 'https://agricoop.nic.in',
    },
];

export default function GovernancePage() {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(null);

    const filtered = SCHEMES.filter(s => {
        const matchCat  = activeCategory === 'all' || s.category === activeCategory;
        const matchSrc  = !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.fullName.toLowerCase().includes(search.toLowerCase()) ||
            s.benefit.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSrc;
    });

    return (
        <div style={{
            minHeight: '100vh', background: '#f8fafc', paddingBottom: 80,
            fontFamily: "'Inter', 'DM Sans', -apple-system, sans-serif",
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg,#065f46,#16a34a)',
                padding: '24px 20px 28px',
            }}>
                <button onClick={() => navigate('/dashboard')} style={{
                    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                    color: '#fff', borderRadius: 8, padding: '6px 12px',
                    fontSize: 13, cursor: 'pointer', marginBottom: 12,
                }}>← Back</button>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>🏛️ Government Schemes</h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: '0 0 16px' }}>
                    Subsidies, insurance & financial support for farmers
                </p>
                {/* Search */}
                <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search schemes..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            width: '100%', padding: '10px 12px 10px 38px',
                            borderRadius: 10, border: 'none',
                            fontSize: 14, color: '#111827', background: '#fff',
                            boxSizing: 'border-box', outline: 'none',
                        }}
                    />
                </div>
            </div>

            {/* Category filter */}
            <div style={{ overflowX: 'auto', padding: '12px 16px 0', whiteSpace: 'nowrap' }}>
                {SCHEME_CATEGORIES.map(c => (
                    <button
                        key={c.key}
                        onClick={() => setActiveCategory(c.key)}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '7px 14px', borderRadius: 20, marginRight: 8,
                            border:      `1.5px solid ${activeCategory === c.key ? '#16a34a' : '#e5e7eb'}`,
                            background:  activeCategory === c.key ? '#f0fdf4' : '#fff',
                            color:       activeCategory === c.key ? '#15803d' : '#374151',
                            fontSize: 13, fontWeight: activeCategory === c.key ? 700 : 500,
                            cursor: 'pointer', whiteSpace: 'nowrap',
                        }}
                    >
                        {c.emoji} {c.label}
                    </button>
                ))}
            </div>

            <div style={{ maxWidth: 640, margin: '0 auto', padding: '16px 16px' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', marginBottom: 12 }}>
                    {filtered.length} SCHEMES AVAILABLE
                </p>

                {filtered.map(scheme => (
                    <div
                        key={scheme.id}
                        style={{
                            background: '#fff', borderRadius: 16,
                            border: `1px solid ${expanded === scheme.id ? scheme.border : '#e5e7eb'}`,
                            marginBottom: 12, overflow: 'hidden',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                            transition: 'border-color 0.2s',
                        }}
                    >
                        {/* Scheme card header */}
                        <button
                            onClick={() => setExpanded(expanded === scheme.id ? null : scheme.id)}
                            style={{
                                width: '100%', padding: '16px', border: 'none',
                                background: 'transparent', cursor: 'pointer', textAlign: 'left',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                                <div style={{
                                    fontSize: 24, width: 48, height: 48, borderRadius: 12,
                                    background: scheme.bg, border: `1px solid ${scheme.border}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    {scheme.emoji}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>{scheme.name}</p>
                                        <span style={{ fontSize: 14, color: '#9ca3af', flexShrink: 0 }}>
                                            {expanded === scheme.id ? '▲' : '▼'}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {scheme.fullName}
                                    </p>
                                    <span style={{
                                        display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                                        background: scheme.bg, border: `1px solid ${scheme.border}`,
                                        fontSize: 12, fontWeight: 600, color: scheme.color,
                                    }}>
                                        {scheme.benefit}
                                    </span>
                                </div>
                            </div>
                        </button>

                        {/* Expanded details */}
                        {expanded === scheme.id && (
                            <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${scheme.border}` }}>
                                <div style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <div>
                                        <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', margin: '0 0 4px' }}>
                                            ABOUT
                                        </p>
                                        <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0 }}>
                                            {scheme.description}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', margin: '0 0 4px' }}>
                                            WHO CAN APPLY
                                        </p>
                                        <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>✅ {scheme.eligibility}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', margin: '0 0 4px' }}>
                                            DEADLINE
                                        </p>
                                        <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>📅 {scheme.deadline}</p>
                                    </div>
                                    <a
                                        href={scheme.applyUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                            display: 'block', textAlign: 'center',
                                            background: `linear-gradient(135deg,${scheme.color},${scheme.color}cc)`,
                                            color: '#fff', borderRadius: 10, padding: '11px',
                                            fontSize: 14, fontWeight: 700, textDecoration: 'none',
                                        }}
                                    >
                                        Apply on Official Portal →
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div style={{
                        background: '#fff', borderRadius: 14, padding: '40px 20px', textAlign: 'center',
                        border: '1px dashed #e5e7eb',
                    }}>
                        <div style={{ fontSize: 40, marginBottom: 8 }}>🔍</div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>No schemes found</p>
                        <p style={{ fontSize: 12, color: '#9ca3af' }}>Try different search terms or category</p>
                    </div>
                )}
            </div>
        </div>
    );
}
