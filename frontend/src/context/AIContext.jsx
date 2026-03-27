import { createContext, useContext, useState, useCallback } from 'react';

/**
 * AIContext — provides a light AI state throughout the app.
 * Keeps track of the last prediction result and any AI loading state.
 */
const AIContext = createContext(null);

export function AIProvider({ children }) {
    const [aiLoading, setAILoading] = useState(false);
    const [lastResult, setLastResult] = useState(null);
    const [aiError, setAIError] = useState(null);

    const clearAIState = useCallback(() => {
        setLastResult(null);
        setAIError(null);
    }, []);

    return (
        <AIContext.Provider value={{
            aiLoading,
            setAILoading,
            lastResult,
            setLastResult,
            aiError,
            setAIError,
            clearAIState,
        }}>
            {children}
        </AIContext.Provider>
    );
}

export function useAI() {
    const ctx = useContext(AIContext);
    if (!ctx) throw new Error('useAI must be used within AIProvider');
    return ctx;
}

export default AIContext;
