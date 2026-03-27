import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./SoilMoistureChart.css";

export default function SoilMoistureChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Simulated soil moisture % (replace with real backend)
    const generated = [
      { time: "6AM", moisture: 35 },
      { time: "9AM", moisture: 42 },
      { time: "12PM", moisture: 48 },
      { time: "3PM", moisture: 44 },
      { time: "6PM", moisture: 47 },
      { time: "9PM", moisture: 52 },
    ];
    setData(generated);
  }, []);

  return (
    <div className="chart-card">
      <h3>🌱 Soil Moisture Levels</h3>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="moistureGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="4 4" opacity={0.15} />

          <XAxis dataKey="time" tick={{ fill: "#475569" }} />
          <YAxis tick={{ fill: "#475569" }} domain={[0, 100]} />

          <Tooltip
            contentStyle={{
              background: "white",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
            }}
          />

          <Line
            type="monotone"
            dataKey="moisture"
            stroke="#0284c7"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#moistureGradient)"
            animationDuration={900}
            dot={{ r: 4, stroke: "#0369a1", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
