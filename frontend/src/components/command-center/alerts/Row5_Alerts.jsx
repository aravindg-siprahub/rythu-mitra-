import React from 'react';
import { useTelemetry } from '../../../hooks/useTelemetry';

const AlertItem = ({ level, message, time, id }) => {
    const colors = {
        'CRITICAL': 'border-l-4 border-l-status-critical bg-status-critical/10 text-status-critical',
        'WARNING': 'border-l-4 border-l-status-warning bg-status-warning/10 text-status-warning',
        'INFO': 'border-l-4 border-l-brand-primary bg-brand-primary/10 text-brand-primary'
    };

    return (
        <div className={`p-3 mb-2 rounded-r border border-neo-border hover:border-neo-text/50 transition-colors cursor-pointer ${colors[level] || colors.INFO} group`}>
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{level}</span>
                    <span className="text-xs font-mono text-neo-muted opacity-50">#{id}</span>
                </div>
                <span className="text-[10px] font-mono opacity-60">
                    {new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
            <p className="text-sm font-medium text-neo-text mt-1 group-hover:text-white transition-colors">
                {message}
            </p>
        </div>
    );
};

const Row5_Alerts = () => {
    const { data } = useTelemetry();
    const alerts = data?.alerts_governance?.alerts_stream || [];

    return (
        <div className="h-80 bg-neo-panel backdrop-blur-md border border-neo-border rounded-xl p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-neo-text font-bold text-lg flex items-center">
                    <span className="text-status-critical mr-2 animate-pulse">●</span>
                    Live Threat Stream
                </h3>
                <button className="text-[10px] px-2 py-1 border border-status-critical text-status-critical rounded hover:bg-status-critical hover:text-white transition-colors">
                    ESCALATE ALL
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                {alerts.length > 0 ? (
                    alerts.map(alert => (
                        <AlertItem
                            key={alert.id}
                            id={alert.id}
                            level={alert.severity}
                            message={alert.message}
                            time={alert.timestamp}
                        />
                    ))
                ) : (
                    <div className="text-center text-neo-muted py-10 text-xs font-mono uppercase tracking-widest">
                        No Active Alerts
                    </div>
                )}
            </div>
        </div>
    );
};

export default Row5_Alerts;
