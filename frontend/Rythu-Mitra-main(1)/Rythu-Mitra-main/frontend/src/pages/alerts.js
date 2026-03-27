import { createContext, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./alerts.css";

const AlertContext = createContext();

/* ===================================================
   PROVIDER WRAPS ENTIRE APP
=================================================== */
export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  /* Add new alert */
  const send = (type, message, duration = 3000) => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, type, message }]);

    /* Auto close */
    setTimeout(() => close(id), duration);
  };

  /* Remove alert */
  const close = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <AlertContext.Provider value={{ send }}>
      {children}

      {/* Render All Alerts */}
      <div className="vp-alert-container">
        <AnimatePresence>
          {alerts.map((a) => (
            <motion.div
              key={a.id}
              className={`vp-alert vp-${a.type}`}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div className="vp-alert-content">
                <span className="vp-alert-icon">
                  {a.type === "success" && "✅"}
                  {a.type === "error" && "❌"}
                  {a.type === "warning" && "⚠️"}
                  {a.type === "info" && "ℹ️"}
                </span>
                <span>{a.message}</span>
              </div>

              <button className="vp-alert-close" onClick={() => close(a.id)}>
                ✖
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AlertContext.Provider>
  );
}

/* ===================================================
   HOOK TO TRIGGER ALERT ANYWHERE
=================================================== */
export function useAlert() {
  return useContext(AlertContext);
}
