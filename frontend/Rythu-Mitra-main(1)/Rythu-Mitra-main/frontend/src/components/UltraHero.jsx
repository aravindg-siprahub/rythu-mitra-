import React from "react";
import { motion } from "framer-motion";
import { fadeInUp, smoothScale } from "./MotionEngine";
import "./UltraHero.css";

export default function UltraHero() {
  return (
    <section className="uh-wrapper">

      {/* 8K Background Video */}
      <video autoPlay muted loop playsInline className="uh-video">
        <source src="/assets/8k-hero-video.mp4" type="video/mp4" />
      </video>

      {/* Glass Overlay Layer */}
      <div className="uh-overlay"></div>

      {/* Center Hero Content */}
      <motion.div
        className="uh-content"
        variants={smoothScale}
        initial="hidden"
        animate="show"
      >
        <motion.h1 variants={fadeInUp(0.2)} className="uh-title">
          RYTHU MITRA <span className="agi-gradient">AGI OS</span>
        </motion.h1>

        <motion.p variants={fadeInUp(0.4)} className="uh-sub">
          Apple Vision Pro Spatial Intelligence + AWS Bedrock L5 +  
          DeepMind Time-Series Predictive Core
        </motion.p>

        <motion.div variants={fadeInUp(0.6)} className="uh-btn-row">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
            className="uh-btn-primary"
          >
            🌱 Begin Crop Intelligence
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
            className="uh-btn-secondary"
          >
            📈 Market Terminal
          </motion.button>
        </motion.div>
      </motion.div>

      {/* HUD — Floating AGI Metrics */}
      <motion.div
        className="uh-hud"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 1 } }}
      >
        <div className="hud-block">
          <span className="hud-label">AGI Uplink</span>
          <span className="hud-value green">Stable</span>
        </div>
        <div className="hud-block">
          <span className="hud-label">Drone Fleet</span>
          <span className="hud-value">14 Active</span>
        </div>
        <div className="hud-block">
          <span className="hud-label">Soil Scan</span>
          <span className="hud-value">Good</span>
        </div>
      </motion.div>

    </section>
  );
}
