import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "./Card";

export default function Dropdown({
    trigger,
    children,
    align = "right",
    className = ""
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={`relative inline-block ${className}`} ref={containerRef}>
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                {trigger}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute top-full mt-2 w-56 z-50 ${align === "right" ? "right-0" : "left-0"}`}
                    >
                        <Card className="!p-1 shadow-xl !bg-[#0f172a] !border-slate-800">
                            <div className="flex flex-col">
                                {React.Children.map(children, (child) =>
                                    child ? React.cloneElement(child, {
                                        onClick: () => {
                                            if (child.props.onClick) child.props.onClick();
                                            setIsOpen(false);
                                        }
                                    }) : null
                                )}
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function DropdownItem({ children, onClick, icon, active = false }) {
    return (
        <button
            onClick={onClick}
            className={`
        flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
        ${active
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }
      `}
        >
            {icon && <span className="text-lg">{icon}</span>}
            {children}
        </button>
    );
}
