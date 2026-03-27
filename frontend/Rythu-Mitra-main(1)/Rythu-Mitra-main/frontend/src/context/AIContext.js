import React, { createContext, useContext, useState, useEffect } from "react";

const AIContext = createContext();

export const useAI = () => useContext(AIContext);

export const AIProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: "ai", text: "Rythu Mitra AI Core online. System telemetry synced." },
        { sender: "ai", text: "Recommendation: Sector 4 moisture levels are dropping. Schedule irrigation within 2 hours." }
    ]);
    const [isListening, setIsListening] = useState(false);

    const speak = (text) => {
        if (!window.speechSynthesis) return;
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "en-IN";
        utter.pitch = 1.1;
        utter.rate = 1;
        speechSynthesis.speak(utter);
    };

    const toggleAI = (state) => {
        setIsOpen(state !== undefined ? state : !isOpen);
    };

    const addMessage = (sender, text) => {
        setMessages((prev) => [...prev, { sender, text }]);
    };

    const simulateResponse = (query) => {
        addMessage("user", query);

        // Mock intelligence logic
        setTimeout(() => {
            let response = "Analyzing data...";
            const q = query.toLowerCase();

            if (q.includes("market") || q.includes("price")) {
                response = "Global Mandi signals are bullish. Wheat is trading at ₹2,450/quintal in your zone. Recommend holding stock for 48 hours.";
            } else if (q.includes("weather") || q.includes("rain")) {
                response = "Neural mesh detects humidity spike at 82%. Precipation probability: 92% between 18:00 and 20:00. Secure Sector 4.";
            } else if (q.includes("disease") || q.includes("pest")) {
                response = "Satellite multi-spectral analysis shows early stress signs in the northern corn quadrant. Possible blight. Pathogen Lab scan ready.";
            } else if (q.includes("harvest") || q.includes("crop")) {
                response = "Optimal harvest window for current cycle opens in 3 days. Soil nutrient N-levels are at peak efficiency: 98.4%.";
            } else {
                response = "Synchronizing with central intelligence... I've logged your query. System telemetry is currently 100% nominal.";
            }

            addMessage("ai", response);
            speak(response);
        }, 1200);
    };

    return (
        <AIContext.Provider value={{
            isOpen,
            toggleAI,
            messages,
            addMessage,
            simulateResponse,
            isListening,
            setIsListening
        }}>
            {children}
        </AIContext.Provider>
    );
};
