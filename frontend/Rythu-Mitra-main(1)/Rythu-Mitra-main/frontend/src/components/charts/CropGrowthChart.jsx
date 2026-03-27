import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "./CropGrowthChart.css";

export default function CropGrowthChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Simulated AI predictions (connect backend later)
    const growth = [
      { stage: "Germination", height: 2, leaves: 1, confidence: 0.92 },
      { stage: "Seedling", height: 6, leaves: 3, confidence: 0.88 },
      { stage: "Vegetative", height: 18, leaves: 8, confidence: 0.94 },
      { stage: "Budding", height: 32, leaves: 12, confidence: 0.91 },
      { stage: "Flowering", height: 55, leaves: 16, confidence: 0.89 },
      { stage: "Maturity", height: 80, leaves: 22, confidence: 0.93 },
    ];
    setData(growth);
  }, []);

  return (
    <div className="growth-chart-card">
      <h3>🌱 Crop Growth Stage Prediction</h3>

      <ResponsiveContainer width="100%" height={330}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="confidenceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />

          <XAxis dataKey="stage" tick={{ fill: "#475569" }} />
          <YAxis
            tick={{ fill: "#475569" }}
            domain={[0, 100]}
          />

          <Tooltip
            contentStyle={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
            }}
          />

          {/* Confidence Area */}
          <Area
            type="monotone"
            dataKey="confidence"
            fill="url(#confidenceFill)"
            stroke="#16a34a"
            strokeWidth={2}
            dot={{ stroke: "#0f172a", strokeWidth: 2 }}
            animationDuration={1000}
          />

          {/* Height Line */}
          <Line
            type="monotone"
            dataKey="height"
            stroke="#0ea5e9"
            strokeWidth={3}
            dot={{ r: 4 }}
            animationDuration={1000}
          />

          {/* Leaf Count Line */}
          <Line
            type="monotone"
            dataKey="leaves"
            stroke="#ef4444"
            strokeWidth={3}
            dot={{ r: 4 }}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
