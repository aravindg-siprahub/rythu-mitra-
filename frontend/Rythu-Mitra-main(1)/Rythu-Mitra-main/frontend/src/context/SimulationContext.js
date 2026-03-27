import React, { createContext, useContext, useState, useEffect } from "react";

const SimulationContext = createContext();

export const useSimulation = () => useContext(SimulationContext);

const RANDOM_EVENTS = [
    { title: "Market Alert", msg: "Tomato prices rising in your region.", type: "warning" },
    { title: "Weather Update", msg: "Expect light rain in the evening.", type: "info" },
    { title: "Logistics", msg: "Truck arrived at the collection center.", type: "success" },
    { title: "AI Hint", msg: "Now is a good time to check soil pH.", type: "info" },
    { title: "System Note", msg: "Satellite sync completed.", type: "info" }
];

export function SimulationProvider({ children }) {
    // --- STATE ---
    const [region, setRegion] = useState("AP-South");
    const [notifications, setNotifications] = useState([
        { id: 1, title: "System Online", msg: "Dashboard initialized.", time: "Just now", type: "info" }
    ]);
    const [systemHealth, setSystemHealth] = useState({ latency: 24, uptime: "99.99%", status: "Healthy" });

    // LIVE DATA STATES
    const [market, setMarket] = useState({ tomato: 42, onion: 18, trend: 12 });
    const [weather, setWeather] = useState({ temp: 28, rain: 82, storm: false });
    const [logistics, setLogistics] = useState({ arriving: "20 min", enRoute: 2 });
    const [workers, setWorkers] = useState({ active: 24, change: 4 });
    const [soil, setSoil] = useState({ n: 280, p: 18, status: "Optimal" });

    // --- HELPERS ---
    const addNotification = (title, msg, type = "info") => {
        const newNote = { id: Date.now(), title, msg, time: "Just now", type };
        setNotifications(prev => [newNote, ...prev].slice(0, 5)); // Keep last 5
    };

    // --- SIMULATION ENGINE ---
    useEffect(() => {
        const tick = setInterval(() => {
            // ... logic ...
            if (Math.random() > 0.9) {
                const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
                addNotification(event.title, event.msg, event.type);
            }
        }, 5000);
        return () => clearInterval(tick);
    }, []);

    // Region Switch Effect
    useEffect(() => {
        addNotification("Region Switched", `Loaded data for ${region}`, "info");
        setSystemHealth(prev => ({ ...prev, status: "Syncing..." }));
        setTimeout(() => setSystemHealth(prev => ({ ...prev, status: "Healthy" })), 800);
    }, [region]);

    const value = {
        region, setRegion,
        notifications,
        systemHealth,
        data: { market, weather, logistics, workers, soil }
    };

    return (
        <SimulationContext.Provider value={value}>
            {children}
        </SimulationContext.Provider>
    );
}
