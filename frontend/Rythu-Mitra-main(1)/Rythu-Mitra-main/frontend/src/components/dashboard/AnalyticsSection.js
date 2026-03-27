import React from "react";
import AWSCard from "../ui/AWSCard";
import SimpleAreaChart from "../charts/SimpleAreaChart";
import { useSimulation } from "../../context/SimulationContext";

export default function AnalyticsSection() {
    const { data } = useSimulation();

    return (
        <div className="py-12 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#232F3E]">Data Analytics & Metrics</h2>
                <div className="flex gap-2 text-sm text-slate-500 bg-slate-100 rounded-lg p-1">
                    <button className="px-3 py-1 bg-white shadow-sm rounded-md text-[#232F3E] font-medium">Live</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Market Overview */}
                <AWSCard className="p-6 col-span-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-[#232F3E] mb-1">Live Market Index</h3>
                            <p className="text-xs text-slate-500 mb-4">Real-time fluctuations</p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-[#232F3E]">₹{data.market.tomato}</span>
                            <p className={`text-xs font-bold ${data.market.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {data.market.trend > 0 ? '+' : ''}{data.market.trend}%
                            </p>
                        </div>
                    </div>

                    <div className="h-[250px] w-full">
                        <SimpleAreaChart
                            data={[
                                { name: '10:00', value: 38 }, { name: '11:00', value: 40 },
                                { name: '12:00', value: data.market.tomato - 5 }, { name: 'Live', value: data.market.tomato }
                            ]}
                            color="primary"
                            height={250}
                        />
                    </div>
                </AWSCard>

                {/* Stacked Side Metrics */}
                <div className="flex flex-col gap-6">
                    {/* Workers */}
                    <AWSCard className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-[#232F3E]">Active Workers</h3>
                            <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold">+{data.workers.change} Today</span>
                        </div>
                        <div className="text-4xl font-bold text-[#232F3E] mb-2">{data.workers.active}</div>
                        <div className="bg-slate-100 rounded-full h-2 w-full overflow-hidden">
                            <div className="bg-[#0073BB] h-full" style={{ width: `${(data.workers.active / 50) * 100}%` }}></div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Capacity Utilization</p>
                    </AWSCard>

                    {/* Logistics */}
                    <AWSCard className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-[#232F3E]">Logistics</h3>
                            <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-xs font-bold">{data.logistics.enRoute} En Route</span>
                        </div>
                        <div className="space-y-3 mt-4">
                            {[1].map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-lg">🚛</div>
                                    <div>
                                        <p className="text-sm font-bold text-[#232F3E]">Truck #402</p>
                                        <p className="text-xs text-slate-500">Arriving in {data.logistics.arriving}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AWSCard>
                </div>

            </div>
        </div>
    );
}
