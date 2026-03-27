import React from "react";
import { motion } from "framer-motion";

export default function Card({
    children,
    className = "",
    hover = true,
    glass = true,
    onClick
}) {
    return (
        <motion.div
            whileHover={hover ? { y: -5, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3)" } : {}}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            onClick={onClick}
            className={`
        relative overflow-hidden rounded-2xl transition-colors duration-300
        ${glass
                    ? "bg-[rgba(15,23,42,0.6)] backdrop-blur-xl border border-slate-800"
                    : "bg-slate-900 border border-slate-800"
                }
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
        >
            {/* Subtle shine effect top-left */}
            <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl transition-opacity group-hover:bg-blue-500/10" />

            {children}
        </motion.div>
    );
}
