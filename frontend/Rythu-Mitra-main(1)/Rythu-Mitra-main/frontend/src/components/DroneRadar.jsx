import React from "react";
import { motion } from "framer-motion";
import "./DroneRadar.css";

export default function DroneRadar() {
  return (
    <motion.div
      className="drone-radar-card"
      whileHover={{ scale: 1.05, rotateX: 8 }}
      transition={{ type: "spring", stiffness: 140 }}
    >
      <div className="radar-wrapper">
        {/* Radar Pulse */}
        <div className="pulse-circle circle-1"></div>
        <div className="pulse-circle circle-2"></div>
        <div className="pulse-circle circle-3"></div>

        {/* Drone Icons */}
        <img src="/assets/drone-radar.png" alt="" className="radar-center-drone" />

        <div className="drone-pin dp1"></div>
        <div className="drone-pin dp2"></div>
        <div className="drone-pin dp3"></div>
        <div className="drone-pin dp4"></div>
      </div>

      <div className="radar-content">
        <h3>Drone Surveillance Radar</h3>
        <p>
          Real-time drone fleet tracking with AGI path prediction, crop scanning,
          and anomaly detection.
        </p>

        <div className="radar-stats">
          <div className="r-stat"><span>Drones Active</span><strong>14</strong></div>
          <div className="r-stat"><span>Scan Radius</span><strong>2.5 km</strong></div>
          <div className="r-stat"><span>AGI Accuracy</span><strong className="green">99.4%</strong></div>
        </div>
      </div>
    </motion.div>
  );
}
