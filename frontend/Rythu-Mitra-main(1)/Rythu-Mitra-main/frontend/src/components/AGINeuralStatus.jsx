import React from "react";
import "./AGINeuralStatus.css";

export default function AGINeuralStatus() {
  return (
    <div className="agi-status">

      {/* Neural Ping */}
      <div className="agi-pulse"></div>

      {/* Status Text */}
      <div className="agi-status-text">
        AWS BEDROCK L5 NEURAL LINK — <span className="green">ACTIVE</span>
      </div>

      {/* Node Indicator */}
      <div className="agi-node">
        <span className="node-id">NODE_US_EAST_1_V8</span>

        {/* Signal Bars */}
        <div className="signal-bars">
          <div className="bar active"></div>
          <div className="bar active"></div>
          <div className="bar active"></div>
          <div className="bar"></div>
        </div>
      </div>
    </div>
  );
}
