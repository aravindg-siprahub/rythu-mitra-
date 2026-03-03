import React from 'react';
import { useTelemetry } from '../../../hooks/useTelemetry';

const Row4_Operations = () => {
    const { data } = useTelemetry();
    const opsData = data?.operations || {
        transport: { active_fleet: 0, utilization_pct: 0, delayed: 0 },
        workforce: { active_demand: 0, fulfilled_today: 0 }
    };

    return (
        <div className="h-80 bg-neo-panel backdrop-blur-md border border-neo-border rounded-xl p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-neo-text font-bold text-lg flex items-center">
                    <span className="text-brand-primary mr-2">✈</span>
                    Logistics & Operations
                </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 h-full">
                {/* Transport Stats */}
                <div className="bg-neo-bg/30 rounded-lg p-3 border border-neo-border">
                    <div className="text-xs text-neo-muted font-mono uppercase mb-2">Fleet Status</div>
                    <div className="flex items-end space-x-2 mb-2">
                        <span className="text-2xl font-bold text-neo-text">{opsData.transport.active_fleet}</span>
                        <span className="text-xs text-brand-success mb-1">● Active</span>
                    </div>
                    <div className="w-full bg-neo-bg h-1.5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-brand-primary transition-all duration-500"
                            style={{ width: `${opsData.transport.utilization_pct}%` }}
                        />
                    </div>
                    <div className="text-[10px] text-neo-muted mt-1 text-right">{opsData.transport.utilization_pct}% Utilization</div>
                </div>

                {/* Worker Stats */}
                <div className="bg-neo-bg/30 rounded-lg p-3 border border-neo-border">
                    <div className="text-xs text-neo-muted font-mono uppercase mb-2">Workforce Demand</div>
                    <div className="flex items-end space-x-2 mb-2">
                        <span className="text-2xl font-bold text-neo-text">{opsData.workforce.active_demand}</span>
                        <span className="text-xs text-brand-accent mb-1">▲ Demand</span>
                    </div>
                    <div className="w-full bg-neo-bg h-1.5 rounded-full overflow-hidden">
                        {/* Mocking a visual bar based on demand since we don't have a max cap in API yet */}
                        <div
                            className="h-full bg-brand-accent transition-all duration-500"
                            style={{ width: '65%' }}
                        />
                    </div>
                    <div className="text-[10px] text-neo-muted mt-1 text-right">Fulfilled Today: {opsData.workforce.fulfilled_today}</div>
                </div>
            </div>
        </div>
    );
};

export default Row4_Operations;
