import React from "react";
import { motion } from "framer-motion";
import "./SatelliteMap.css";

export default function SatelliteMap() {
  return (
    <motion.div 
      className="satmap-card"
      whileHover={{ scale: 1.05, rotateY: 10 }}
      transition={{ type: "spring", stiffness: 150 }}
    >
      <div className="satmap-image-wrapper">
        <img src="/assets/satellite-map-8k.jpg" className="satmap-image" alt="sat-map" />

        {/* 3D Glow */}
        <div className="satmap-glow"></div>

        {/* Overlays */}
        <div className="satmap-overlay">
          <span className="tag tag-green">Healthy</span>
          <span className="tag tag-yellow">Moderate</span>
          <span className="tag tag-red">Critical Zones</span>
        </div>
      </div>

      <div className="satmap-content">
        <h3>Satellite Intelligence Map</h3>
        <p>
          Real-time AGI mapping of crop density, soil moisture pockets,
          water stress regions and carbon heat signatures.
        </p>

        <div className="satmap-stats">
          <div><span>Region Coverage</span><strong>93%</strong></div>
          <div><span>Heat Index</span><strong>Low</strong></div>
          <div><span>Cloud Layers</span><strong>2 active</strong></div>
        </div>
      </div>
    </motion.div>
  );
}
