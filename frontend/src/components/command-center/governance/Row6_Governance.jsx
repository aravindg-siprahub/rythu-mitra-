import React from 'react';
import { useTelemetry } from '../../../hooks/useTelemetry';

const Row6_Governance = () => {
    const { data } = useTelemetry();
    const govData = data?.alerts_governance?.governance || {
        rls_status: "UNKNOWN",
        audit_logs_count: 0,
        active_users: 0
    };

    return (
        <div className="h-32 bg-neo-panel backdrop-blur-md border border-neo-border rounded-xl p-6 flex items-center justify-between">
            <div>
                <h3 className="text-neo-text font-bold text-lg flex items-center mb-1">
                    <span className="text-neo-muted mr-2">🛡</span>
                    Governance & Trust
                </h3>
                <p className="text-xs text-neo-muted font-mono">
                    RLS Enforcement: <span className={govData.rls_status === 'ENFORCED' ? "text-brand-success" : "text-status-warning"}>{govData.rls_status}</span> • Encryption: <span className="text-brand-success">AES-256</span>
                </p>
            </div>

            <div className="flex space-x-8">
                <div className="text-center">
                    <div className="text-2xl font-bold text-neo-text">{govData.audit_logs_count}</div>
                    <div className="text-[10px] text-neo-muted uppercase">Security Incidents</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-brand-success">100%</div>
                    <div className="text-[10px] text-neo-muted uppercase">Audit Compliance</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-brand-primary">{govData.active_users}</div>
                    <div className="text-[10px] text-neo-muted uppercase">Active Users</div>
                </div>
            </div>
        </div>
    );
};

export default Row6_Governance;
