import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../api/api";
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

    const simulateResponse = async (query) => {
        addMessage("user", query);
        // setIsProcessing(true); // Assuming state exists or will be added, but safe to omit for now if not defined

        try {
            // Enterprise RAG Integration
            const response = await API.post('/api/v1/ai/chat/', { query });
            const aiText = response.data.response;
            // const source = response.data.source; 

            addMessage("ai", aiText);
            speak(aiText);

        } catch (error) {
            console.error("AI Engine Error:", error);
            const fallback = "⚠️ Neural Engine Offline. Please check your connection.";
            addMessage("ai", fallback);
            speak(fallback);
        }
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
