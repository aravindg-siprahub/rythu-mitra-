import { createContext, useContext, useState, useCallback } from 'react';

/**
 * AlertProvider — lightweight global alert/toast context for Rythu Mitra.
 * Use `useAlert()` to trigger success/error/info banners.
 */
const AlertContext = createContext(null);

export function AlertProvider({ children }) {
    const [alerts, setAlerts] = useState([]);

    const addAlert = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now();
        setAlerts(prev => [...prev, { id, message, type }]);
        if (duration > 0) {
            setTimeout(() => {
                setAlerts(prev => prev.filter(a => a.id !== id));
            }, duration);
        }
    }, []);

    const removeAlert = useCallback((id) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    }, []);

    const alertColors = {
        success: { bg: '#dcfce7', border: '#16a34a', color: '#15803d' },
        error:   { bg: '#fee2e2', border: '#dc2626', color: '#b91c1c' },
        warning: { bg: '#fef3c7', border: '#d97706', color: '#92400e' },
        info:    { bg: '#dbeafe', border: '#3b82f6', color: '#1d4ed8' },
    };

    const alertIcons = {
        success: '✅',
        error:   '❌',
        warning: '⚠️',
        info:    'ℹ️',
    };

    return (
        <AlertContext.Provider value={{ addAlert, removeAlert, alerts }}>
            {children}

            {/* Alert banner container */}
            {alerts.length > 0 && (
                <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-[9999] flex flex-col gap-2 items-center sm:items-end pointer-events-none">
                    {alerts.map(alert => {
                        const colors = alertColors[alert.type] || alertColors.info;
                        return (
                            <div key={alert.id} className="pointer-events-auto w-full sm:w-auto min-w-[300px] sm:max-w-[360px]" style={{
                                background:   colors.bg,
                                border:       `1px solid ${colors.border}`,
                                borderRadius: 12,
                                padding:      '12px 16px',
                                display:      'flex',
                                alignItems:   'flex-start',
                                gap:          10,
                                boxShadow:    '0 4px 12px rgba(0,0,0,0.1)',
                                animation:    'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            }}>
                                <span style={{ fontSize: 16 }}>
                                    {alertIcons[alert.type]}
                                </span>
                                <p style={{
                                    flex:       1,
                                    fontSize:   13,
                                    color:      colors.color,
                                    fontWeight: 600,
                                    margin:     0,
                                    lineHeight: 1.4,
                                }}>
                                    {alert.message}
                                </p>
                                <button
                                    onClick={() => removeAlert(alert.id)}
                                    style={{
                                        background: 'transparent',
                                        border:     'none',
                                        cursor:     'pointer',
                                        fontSize:   16,
                                        color:      colors.color,
                                        padding:    0,
                                        lineHeight: 1,
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </AlertContext.Provider>
    );
}

export function useAlert() {
    const ctx = useContext(AlertContext);
    if (!ctx) throw new Error('useAlert must be used within AlertProvider');
    return ctx;
}

export default AlertContext;
