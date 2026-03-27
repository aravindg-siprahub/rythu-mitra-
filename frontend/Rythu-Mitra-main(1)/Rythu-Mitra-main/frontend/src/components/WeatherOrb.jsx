import React from "react";
import { motion } from "framer-motion";
import { CloudIcon } from "@heroicons/react/24/outline";
import "./WeatherOrb.css";

export default function WeatherOrb() {
  return (
    <motion.div
      className="weather-orb-card"
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 120 }}
    >
      <div className="weather-orb-glow"></div>

      <div className="weather-orb-content">
        <CloudIcon className="weather-icon" />
        <div className="temperature">29°C</div>
        <p>Hyper-Local Rainfall Predicted @ 14:00 IST</p>
      </div>
    </motion.div>
  );
}
