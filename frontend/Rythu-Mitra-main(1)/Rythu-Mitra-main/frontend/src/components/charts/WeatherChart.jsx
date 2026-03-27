import { useEffect, useState } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "./WeatherChart.css";

export default function WeatherChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Simulated weather values (connect backend later)
    const forecast = [
      { day: "Mon", temp: 28, rain: 2 },
      { day: "Tue", temp: 30, rain: 5 },
      { day: "Wed", temp: 33, rain: 1 },
      { day: "Thu", temp: 31, rain: 8 },
      { day: "Fri", temp: 29, rain: 3 },
      { day: "Sat", temp: 27, rain: 10 },
      { day: "Sun", temp: 32, rain: 0 },
    ];
    setData(forecast);
  }, []);

  return (
    <div className="weather-chart-card">
      <h3>🌦️ Weekly Weather Forecast</h3>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />

          <XAxis dataKey="day" tick={{ fill: "#475569" }} />
          <YAxis
            yAxisId="left"
            tick={{ fill: "#475569" }}
            domain={[20, 40]}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: "#475569" }}
          />

          <Tooltip
            contentStyle={{
              background: "white",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
            }}
          />

          {/* Rainfall Bars */}
          <Bar
            yAxisId="right"
            dataKey="rain"
            fill="#0ea5e9"
            radius={[6, 6, 0, 0]}
            animationDuration={900}
          />

          {/* Temperature Line */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="temp"
            stroke="#ef4444"
            strokeWidth={3}
            dot={{ r: 4, stroke: "#b91c1c", strokeWidth: 2 }}
            animationDuration={900}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
