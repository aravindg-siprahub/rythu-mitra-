import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const themeColors = {
    primary: "#3b82f6", // Blue
    success: "#10b981", // Green
    warning: "#f59e0b", // Amber
    danger: "#ef4444",  // Red
};

export default function SimpleAreaChart({
    data,
    dataKey = "value",
    xAxisKey = "name",
    color = "primary",
    height = 300
}) {
    const strokeColor = themeColors[color] || themeColors.primary;

    return (
        <div style={{ width: "100%", height }}>
            <ResponsiveContainer>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={strokeColor} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey={xAxisKey}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#0f172a",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                        }}
                        itemStyle={{ color: "#f8fafc" }}
                    />
                    <Area
                        type="monotone"
                        dataKey={dataKey}
                        stroke={strokeColor}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill={`url(#gradient-${color})`}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
