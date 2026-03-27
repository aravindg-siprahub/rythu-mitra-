import React, { useEffect, useState } from "react";
import API from "../api/api";

function Farmers() {
  const [farmers, setFarmers] = useState([]);

  const loadFarmers = async () => {
    const res = await API.get("/farmers/");
    setFarmers(res.data);
  };

  useEffect(() => {
    loadFarmers();
  }, []);

  return (
    <div>
      <h2>👨‍🌾 Farmers List</h2>
      {farmers.map((f) => (
        <p key={f.id}>{f.name} — {f.crop}</p>
      ))}
    </div>
  );
}

export default Farmers;
