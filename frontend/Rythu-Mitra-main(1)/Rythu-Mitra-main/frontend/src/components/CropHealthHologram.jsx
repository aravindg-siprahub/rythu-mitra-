import React from "react";
import { motion } from "framer-motion";
import "./CropHealthHologram.css";

export default function CropHealthHologram() {
  return (
    <motion.div
      className="hologram-card"
      whileHover={{ scale: 1.05, rotateX: 8 }}
      transition={{ type: "spring", stiffness: 160 }}
    >

      {/* HOLOGRAM 3D IMAGE */}
      <div className="hologram-wrapper">
        <img src="/assets/crop-holo.png" alt="" className="hologram-image" />
        <div className="holo-light"></div>
      </div>

      {/* DETAILS */}
      <div className="hologram-content">
        <h3>Crop Health Hologram</h3>
        <p>
          Spatial hologram showing chlorophyll levels, water stress, and leaf respiration
          monitored through AGI spectral analysis.
        </p>

        <div className="holo-stats">
          <div>
            <span className="label">Health Index</span>
            <span className="value">96.3%</span>
          </div>

          <div>
            <span className="label">Respiration Rate</span>
            <span className="value">4.1 µmol/m²s</span>
          </div>

          <div>
            <span className="label">AGI Prediction</span>
            <span className="value green">Optimal</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
