import React, { useEffect, useState } from "react";
import API from "../api";

function Farmers() {
  const [farmers, setFarmers] = useState([]);

  useEffect(() => {
    API.get("/farmers/")
      .then((response) => {
        setFarmers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching farmers:", error);
      });
  }, []);

  return (
    <div>
      <h1>Farmers</h1>
      {farmers.length === 0 ? (
        <p>No farmers found.</p>
      ) : (
        farmers.map((farmer) => (
          <p key={farmer.id}>{farmer.name}</p>
        ))
      )}
    </div>
  );
}

export default Farmers;
