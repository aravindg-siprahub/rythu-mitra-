import React, { useState, useEffect } from 'react';

const Row2_RegionalMap = () => {
    const [selectedRegion, setSelectedRegion] = useState('National');
    const [mapData, setMapData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch GeoJSON data from our new API
        const fetchGeoData = async () => {
            try {
                // In local dev, assume backend is at localhost:8000
                const response = await fetch('http://localhost:8000/api/v1/farmers/geo/national-map/');
                const data = await response.json();
                setMapData(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch Map Data:", error);
                setLoading(false);
            }
        };

        fetchGeoData();
    }, []);

    // Helper to calculate summary from features if available
    const activeHotspots = mapData?.features?.filter(f => f.properties.type === 'DISEASE_HOTSPOT').length || 0;

    return (
        <div className="h-[500px] w-full bg-neo-panel backdrop-blur-md border border-neo-border rounded-xl p-4 flex flex-col relative overflow-hidden group">
            <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-center mb-4 z-10">
                <div>
                    <h3 className="text-neo-text font-bold text-lg flex items-center">
                        <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse mr-2" />
                        Regional Intelligence Grid
                    </h3>
                    <p className="text-neo-muted text-xs font-mono uppercase tracking-widest">
                        Geospatial Risk & Yield Heatmap
                    </p>
                </div>
                <div className="flex space-x-2">
                    {['National', 'North', 'South', 'East', 'West'].map(region => (
                        <button
                            key={region}
                            onClick={() => setSelectedRegion(region)}
                            className={`px-3 py-1 text-xs font-mono rounded border transition-all ${selectedRegion === region
                                ? 'bg-brand-primary/20 border-brand-primary text-brand-primary'
                                : 'bg-transparent border-neo-border text-neo-muted hover:text-neo-text'
                                }`}
                        >
                            {region}
                        </button>
                    ))}
                </div>
            </div>

            {/* Map Visualization Area */}
            <div className="flex-1 relative flex items-center justify-center border border-neo-border/30 rounded-lg bg-neo-bg/50 overflow-hidden">
                {/* Simulated Map Content since we don't have a real map library installed in this snippet */}
                <div className="text-center relative w-full h-full flex flex-col items-center justify-center">
                    {loading ? (
                        <div className="text-brand-primary font-mono text-sm animate-pulse">Initializing Geo-Satellite Link...</div>
                    ) : (
                        <>
                            <div className="animate-spin-slow absolute inset-0 opacity-10 pointer-events-none">
                                {/* Radar effect */}
                            </div>
                            <svg className="w-64 h-64 text-neo-muted/20 mx-auto" fill="currentColor" viewBox="0 0 100 100">
                                <path d="M50 10 L60 30 L80 40 L70 60 L80 80 L50 90 L20 80 L30 60 L20 40 L40 30 Z" />
                            </svg>
                            <p className="text-neo-muted text-sm font-mono mt-4">
                                Monitoring {mapData?.features?.length || 0} entities in sector {selectedRegion.toUpperCase()}
                            </p>

                            {/* Hotspot Floating Alert logic */}
                            {activeHotspots > 0 && (
                                <div className="absolute top-1/4 left-1/4 p-2 bg-neo-bg/90 border border-status-critical rounded shadow-lg backdrop-blur text-left w-32 animate-bounce-slow">
                                    <div className="text-[10px] text-status-critical font-bold uppercase">OUTBREAK ALERT</div>
                                    <div className="text-xs text-neo-text">{activeHotspots} Clusters Found</div>
                                    <div className="text-[10px] text-neo-muted">See Layer 5 for details</div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Map Legend */}
            <div className="mt-4 flex items-center space-x-6 z-10 text-xs font-mono text-neo-muted">
                <div className="flex items-center"><span className="w-3 h-3 bg-status-critical rounded mr-2" /> Critical Risk</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-status-warning rounded mr-2" /> Moderate Watch</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-brand-success rounded mr-2" /> Optimal Yield</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-brand-primary rounded mr-2" /> Active Logistics</div>
            </div>
        </div>
    );
};

export default Row2_RegionalMap;
