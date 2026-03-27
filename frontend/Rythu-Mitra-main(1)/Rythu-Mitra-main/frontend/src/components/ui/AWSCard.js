import React from "react";
import { motion } from "framer-motion";

export default function AWSCard({ children, className = "", onClick }) {
    return (
        <motion.div
            whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={onClick}
            className={`rounded-[24px] overflow-hidden cursor-pointer ${className.includes('bg-') ? '' : 'bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-slate-100'} ${className}`}
        >
            {children}
        </motion.div>
    );
}
