import { NavLink } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Sidebar.css";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      className={collapsed ? "rm-sidebar collapsed" : "rm-sidebar"}
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {/* LOGO */}
      <div className="rm-logo" onClick={() => setCollapsed(!collapsed)}>
        <motion.img
          src="https://images.unsplash.com/photo-1523741543316-beb7fc7023d8"
          alt="Rythu Mitra"
          className="rm-logo-img"
          whileHover={{ scale: 1.07 }}
          transition={{ duration: 0.25 }}
        />

        <AnimatePresence>
          {!collapsed && (
            <motion.h2
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
            >
              Rythu Mitra
            </motion.h2>
          )}
        </AnimatePresence>
      </div>

      {/* NAVIGATION */}
      <nav className="rm-nav">
        {menuItems.map((item, index) => (
          <Menu
            key={index}
            to={item.to}
            icon={item.icon}
            label={item.label}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* STATUS */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            className="rm-sidebar-status"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
          >
            <p>📍 Telangana</p>
            <p>🌾 Crop: Paddy</p>
            <p>🧠 AI Active</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            className="rm-sidebar-footer"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
          >
            <p>AI for Smart Farming</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}

/* ======================
   MENU DATA
====================== */
const menuItems = [
  { to: "/dashboard", icon: "📊", label: "Dashboard" },
  { to: "/crop-recommendation", icon: "🌱", label: "AI Crop Recommendation" },
  { to: "/disease-detection", icon: "🦠", label: "AI Disease Detection" },
  { to: "/market-prices", icon: "💹", label: "Market Prices" },
  { to: "/weather", icon: "🌦️", label: "Weather Intelligence" },
  { to: "/workers", icon: "👨‍🌾", label: "Workers" },
  { to: "/transport", icon: "🚜", label: "Transport" },
  { to: "/profile", icon: "👤", label: "Profile" },
];

/* ======================
   MENU COMPONENT
====================== */
function Menu({ to, icon, label, collapsed }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => (isActive ? "rm-link active" : "rm-link")}
    >
      <motion.span
        className="rm-icon"
        whileHover={{ scale: 1.15 }}
        transition={{ duration: 0.20 }}
      >
        {icon}
      </motion.span>

      <AnimatePresence>
        {!collapsed && (
          <motion.span
            className="rm-text"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  );
}
