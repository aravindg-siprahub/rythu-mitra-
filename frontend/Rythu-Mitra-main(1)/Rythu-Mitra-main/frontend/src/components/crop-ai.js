import React, { useState } from "react";
import API from "../api/api";

function CropAI() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);

  const detectDisease = async () => {
    const formData = new FormData();
    formData.append("image", image);

    const res = await API.post("/ai/disease/", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    setResult(res.data);
  };

  return (
    <div>
      <h2>🌿 Leaf Disease Detection</h2>

      <input type="file" onChange={(e) => setImage(e.target.files[0])} />

      <button onClick={detectDisease}>Detect</button>

      {result && (
        <div>
          <p>Disease: {result.disease}</p>
          <p>Confidence: {result.confidence}</p>
        </div>
      )}
    </div>
  );
}

export default CropAI;
