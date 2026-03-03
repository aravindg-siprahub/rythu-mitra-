import React from 'react';
import { useTelemetry } from '../../../hooks/useTelemetry';

const ModelStatus = ({ name, version, status, accuracy, drift, latency }) => (
    <div className="p-3 bg-neo-bg/40 rounded border border-neo-border hover:border-brand-primary/50 transition-colors group">
        <div className="flex justify-between items-start mb-2">
            <div>
                <div className="text-xs text-brand-secondary font-mono mb-0.5">{version}</div>
                <div className="text-sm font-bold text-neo-text group-hover:text-brand-primary transition-colors">{name}</div>
            </div>
            <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${status === 'ONLINE' ? 'bg-brand-success/10 border-brand-success/30 text-brand-success' : 'bg-status-critical/10 border-status-critical/30 text-status-critical'
                }`}>
                {status}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-2">
            <div>
                <div className="text-neo-muted text-[10px]">ACCURACY</div>
                <div className="text-neo-text">{accuracy}%</div>
            </div>
            <div>
                <div className="text-neo-muted text-[10px]">DRIFT</div>
                <div className={`${drift > 0.1 ? 'text-status-warning' : 'text-brand-success'}`}>{drift}</div>
            </div>
        </div>

        {/* Latency Bar */}
        <div className="w-full bg-neo-bg h-1 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full ${latency < 100 ? 'bg-brand-primary' : 'bg-status-warning'}`}
                style={{ width: `${Math.min((latency / 200) * 100, 100)}%` }}
            />
        </div>
        <div className="flex justify-between mt-1">
            <span className="text-[10px] text-neo-muted">LATENCY</span>
            <span className="text-[10px] text-neo-text">{latency}ms</span>
        </div>
    </div>
);

const Row3_AIMonitoring = () => {
    const { data } = useTelemetry();
    const aiData = data?.ai || {
        models: [
            { name: "Crop Recommendation", version: "v2.1", status: "OFFLINE", accuracy: 0, drift: 0, latency: 0 },
            { name: "Disease Vision (CV)", version: "v1.8", status: "OFFLINE", accuracy: 0, drift: 0, latency: 0 }
        ],
        total_inferences: 0
    };

    return (
        <div className="h-[500px] bg-neo-panel backdrop-blur-md border border-neo-border rounded-xl p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-neo-text font-bold text-lg flex items-center">
                        <span className="text-brand-secondary mr-2">❖</span>
                        Neural Mesh Status
                    </h3>
                    <p className="text-neo-muted text-xs font-mono uppercase tracking-widest">
                        Real-time Inference Monitoring
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-neo-text font-mono">
                        {aiData.total_inferences?.toLocaleString() || 0}
                    </div>
                    <div className="text-[10px] text-neo-muted uppercase">Daily Inferences</div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                {aiData.models.map((model, idx) => (
                    <ModelStatus
                        key={idx}
                        name={model.name}
                        version={model.version}
                        status={model.status}
                        accuracy={model.accuracy}
                        drift={model.drift_score} // Mapping API 'drift_score' to prop 'drift'
                        latency={model.latency_ms} // Mapping API 'latency_ms' to prop 'latency'
                    />
                ))}
            </div>

            <div className="mt-4 pt-3 border-t border-neo-border">
                <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-neo-muted">Total Active Nodes</span>
                    <span className="text-brand-primary">{aiData.models.length * 32}/128</span>
                </div>
                <div className="w-full bg-neo-bg h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-brand-secondary w-full animate-pulse-slow" />
                </div>
            </div>
        </div>
    );
};

export default Row3_AIMonitoring;
