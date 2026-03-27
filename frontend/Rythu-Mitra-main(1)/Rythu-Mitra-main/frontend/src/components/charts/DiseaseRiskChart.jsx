import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./DiseaseRiskChart.css";

export default function DiseaseRiskChart() {
  const [data, setData] = useState([]);

  // Simulate live chart updates (replace with backend later)
  useEffect(() => {
    const generated = [
      { day: "Mon", risk: 42 },
      { day: "Tue", risk: 38 },
      { day: "Wed", risk: 50 },
      { day: "Thu", risk: 58 },
      { day: "Fri", risk: 62 },
      { day: "Sat", risk: 55 },
      { day: "Sun", risk: 48 },
    ];
    setData(generated);
  }, []);

  return (
    <div className="chart-card">
      <h3>🦠 Disease Risk Trend</h3>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="4 4" opacity={0.2} />
          <XAxis dataKey="day" tick={{ fill: "#475569" }} />
          <YAxis tick={{ fill: "#475569" }} domain={[0, 100]} />

          <Tooltip
            contentStyle={{
              background: "white",
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
            }}
          />

          <Area
            type="monotone"
            dataKey="risk"
            stroke="#dc2626"
            strokeWidth={3}
            fill="url(#riskGradient)"
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
