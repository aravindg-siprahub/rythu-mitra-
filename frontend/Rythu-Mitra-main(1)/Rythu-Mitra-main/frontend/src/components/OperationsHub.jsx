import React from "react";
import { motion } from "framer-motion";
import { CpuChipIcon, UserGroupIcon, TruckIcon } from "@heroicons/react/24/outline";
import "./OperationsHub.css";

export default function OperationsHub({ onWorkers, onTransport }) {
  return (
    <motion.div
      className="ops-hub-card glass-ops"
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 130, damping: 12 }}
    >
      <div className="ops-header">
        <CpuChipIcon className="ops-icon" />
        <h3 className="ops-title">Autonomous Operations Hub</h3>
      </div>

      <p className="ops-description">
        AGI-driven deployment of manpower, logistics, and automated distribution.
      </p>

      <div className="ops-action-grid">
        
        {/* Workers */}
        <motion.div
          onClick={onWorkers}
          whileHover={{ scale: 1.07 }}
          className="ops-action-card"
        >
          <UserGroupIcon className="ops-action-icon" />
          <h4>Deploy Workers</h4>
          <p>Assign harvesting & farm labor dynamically.</p>
        </motion.div>

        {/* Transport */}
        <motion.div
          onClick={onTransport}
          whileHover={{ scale: 1.07 }}
          className="ops-action-card"
        >
          <TruckIcon className="ops-action-icon" />
          <h4>Transport Network</h4>
          <p>Smart logistics routing with AGI load balancing.</p>
        </motion.div>

      </div>

      <div className="ops-stats">
        <div className="stat-block">
          <h5>Active Fleets</h5>
          <span>12</span>
        </div>
        <div className="stat-block">
          <h5>Worker Units</h5>
          <span>58</span>
        </div>
        <div className="stat-block">
          <h5>AGI Optimization</h5>
          <span className="stat-green">89%</span>
        </div>
      </div>
    </motion.div>
  );
}
