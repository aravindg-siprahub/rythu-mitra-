import React from "react";
import { motion } from "framer-motion";
import { BeakerIcon, CubeIcon } from "@heroicons/react/24/outline";
import "./SoilAnalytics.css";

export default function SoilAnalytics() {
  return (
    <motion.div
      className="soil-card"
      whileHover={{ scale: 1.05, rotateY: 10 }}
      transition={{ type: "spring", stiffness: 130 }}
    >
      <div className="soil-image-wrapper">
        <img src="/assets/soil-depth.png" alt="" className="soil-image" />
        <div className="soil-ambient"></div>
      </div>

      <div className="soil-content">
        <h3>Soil Analytics Engine</h3>
        <p>
          AWS IoT + AGI soil compositional analysis for nitrogen, moisture, carbon,
          and micro-nutrient absorption.
        </p>

        <div className="soil-stats-grid">
          <div className="soil-stat">
            <BeakerIcon className="soil-stat-icon" />
            <span className="stat-label">Nitrogen</span>
            <span className="stat-value">27 mg/kg</span>
          </div>

          <div className="soil-stat">
            <CubeIcon className="soil-stat-icon" />
            <span className="stat-label">Moisture</span>
            <span className="stat-value">18%</span>
          </div>

          <div className="soil-stat">
            <BeakerIcon className="soil-stat-icon" />
            <span className="stat-label">Organic Carbon</span>
            <span className="stat-value">3.7%</span>
          </div>

          <div className="soil-stat">
            <CubeIcon className="soil-stat-icon" />
            <span className="stat-label">AGI Health Score</span>
            <span className="stat-value green">92%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
