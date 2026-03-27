import React from "react";
import { motion } from "framer-motion";
import { staggerContainer, hover3D, fadeInUp } from "./MotionEngine";
import "./BentoGrid.css";

export default function BentoGrid({ children }) {
  return (
    <motion.div
      className="bento-grid-wrapper"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <motion.div className="bento-grid">
        {React.Children.map(children, (child, index) => (
          <motion.div
            className="bento-card"
            variants={fadeInUp(index * 0.1)}
            whileHover={hover3D.whileHover}
            whileTap={{ scale: 0.97 }}
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
