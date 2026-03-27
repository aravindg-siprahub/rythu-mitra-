import React, { useState } from "react";
import API from "../api/api";

function MarketAI() {
  const [crop, setCrop] = useState("");
  const [forecast, setForecast] = useState(null);

  const getForecast = async () => {
    const res = await API.get(`/ai/market/?crop=${crop}`);
    setForecast(res.data);
  };

  return (
    <div>
      <h2>📈 Market Forecast</h2>

      <input
        type="text"
        placeholder="Enter crop name"
        onChange={(e) => setCrop(e.target.value)}
      />

      <button onClick={getForecast}>Predict</button>

      {forecast && (
        <div>
          <p>Expected Price: {forecast.price}</p>
        </div>
      )}
    </div>
  );
}

export default MarketAI;
