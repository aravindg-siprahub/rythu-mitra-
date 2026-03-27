import { createContext, useContext, useState } from 'react';

/**
 * SimulationContext — provides demo/simulation mode toggle.
 * When simulation mode is on, mock data is used instead of live API.
 */
const SimulationContext = createContext(null);

export function SimulationProvider({ children }) {
    const [simulationMode, setSimulationMode] = useState(false);

    const toggleSimulation = () => setSimulationMode(prev => !prev);

    return (
        <SimulationContext.Provider value={{
            simulationMode,
            setSimulationMode,
            toggleSimulation,
        }}>
            {children}
        </SimulationContext.Provider>
    );
}

export function useSimulation() {
    const ctx = useContext(SimulationContext);
    if (!ctx) throw new Error('useSimulation must be used within SimulationProvider');
    return ctx;
}

export default SimulationContext;
