import React from "react";
import { motion } from "framer-motion";
import { GlobeAltIcon } from "@heroicons/react/24/outline";
import "./MarketTerminal.css";

export default function MarketTerminal() {
  return (
    <motion.div
      className="market-terminal-card"
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 140 }}
    >
      <div className="market-header">
        <GlobeAltIcon className="market-icon" />
        <h3>Global Market Forecast</h3>
      </div>

      <div className="market-lines">
        <div className="mt-line line-1"></div>
        <div className="mt-line line-2"></div>
        <div className="mt-line line-3"></div>
      </div>

      <div className="market-body">
        <div className="price-row">
          <span>PADDY (A-Grade)</span>
          <span className="price-up">₹2450 ↑</span>
        </div>

        <p className="market-prediction">
          AGI predicts **12.8% demand surge** next quarter.
        </p>
      </div>
    </motion.div>
  );
}
