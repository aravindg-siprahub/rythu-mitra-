import React, { useState } from "react";
import API from "../api/api";

function WeatherAI() {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);

  const getWeather = async () => {
    const res = await API.get(`/ai/weather/?city=${city}`);
    setData(res.data);
  };

  return (
    <div>
      <h2>☁ Weather AI</h2>

      <input
        type="text"
        placeholder="Enter city"
        onChange={(e) => setCity(e.target.value)}
      />

      <button onClick={getWeather}>Get Weather</button>

      {data && (
        <div>
          <p>Temperature: {data.temperature}</p>
          <p>Condition: {data.condition}</p>
        </div>
      )}
    </div>
  );
}

export default WeatherAI;
