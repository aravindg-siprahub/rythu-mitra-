import { motion } from "framer-motion";

export default function ExplainableModal({ open, onClose, data }) {
  if (!open || !data) return null;

  return (
    <div className="rm-modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="rm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{data.title}</h2>
        <p className="rm-modal-value">{data.value}</p>
        <p className="rm-modal-confidence">
          AI Confidence: <b>{data.confidence}%</b>
        </p>

        <ul>
          {data.reasons.map((r, i) => (
            <li key={i}>• {r}</li>
          ))}
        </ul>

        <button onClick={onClose}>Close</button>
      </motion.div>
    </div>
  );
}
