import React from "react";
import { motion } from "framer-motion";
import { BeakerIcon } from "@heroicons/react/24/outline";
import "./DiseaseScanner.css";

export default function DiseaseScanner() {
  return (
    <motion.div
      className="disease-card"
      whileHover={{ scale: 1.05, rotateY: 10 }}
      transition={{ type: "spring", stiffness: 150 }}
    >
      <div className="scanner-background">
        <div className="scan-line"></div>
        <div className="scan-grid"></div>
      </div>

      <div className="scanner-content">
        <BeakerIcon className="scanner-icon" />
        <h3>AGI Disease Scanner</h3>
        <p>Detect leaf diseases with 99.9% AGI Vision accuracy.</p>
      </div>
    </motion.div>
  );
}
