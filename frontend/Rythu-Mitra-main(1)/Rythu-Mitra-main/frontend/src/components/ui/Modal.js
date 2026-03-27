import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import Card from "./Card";

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    width = "max-w-md"
}) {
    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => (document.body.style.overflow = "unset");
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className={`relative w-full ${width} z-10`}
                    >
                        <Card className="!bg-[#0f172a] !border-slate-800 shadow-2xl">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-slate-800 p-6">
                                <h3 className="text-xl font-semibold text-white">{title}</h3>
                                <button
                                    onClick={onClose}
                                    className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6">
                                {children}
                            </div>
                        </Card>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
