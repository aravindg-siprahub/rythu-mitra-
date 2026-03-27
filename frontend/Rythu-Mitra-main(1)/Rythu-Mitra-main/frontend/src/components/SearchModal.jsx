import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchModal({ open, onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);

  const items = [
    "Crop Recommendation",
    "Disease Detection",
    "Market Price Intelligence",
    "Weather Intelligence",
    "Worker Booking",
    "Transport Booking",
    "Soil Moisture Analysis",
    "Fertilizer Prediction",
    "Pest Classification",
    "Disease Severity Estimation",
  ];

  const filtered = items.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase())
  );

  /* Auto-focus search input */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  /* Close on ESC key */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown")
        setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      if (e.key === "ArrowUp")
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      if (e.key === "Enter" && filtered[activeIndex]) {
        onSelect(filtered[activeIndex]);
        onClose();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [filtered, activeIndex]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="search-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="search-modal glass-box"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            placeholder="Search anything…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />

          {/* Results List */}
          <ul className="search-results">
            {filtered.length === 0 && (
              <li className="no-results">No matches found</li>
            )}

            {filtered.map((item, i) => (
              <motion.li
                key={i}
                className={`search-item ${
                  activeIndex === i ? "active" : ""
                }`}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                🔍 {item}
              </motion.li>
            ))}
          </ul>

          {/* Close Button */}
          <button className="search-close" onClick={onClose}>
            ✖ Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
