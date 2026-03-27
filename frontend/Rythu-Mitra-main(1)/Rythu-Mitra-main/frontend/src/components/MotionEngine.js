/* ============================================================
   MotionEngine.js — VisionOS Motion Physics Engine (SAFE BUILD)
   ------------------------------------------------------------
   Fixes:
   ✔ element.style undefined
   ✔ missing DOM ref
   ✔ UltraHero crash
   ✔ BentoGrid card tilt stability
   ------------------------------------------------------------
   Features:
   - Fade In Up
   - Smooth Scale
   - Hover 3D Tilt
   - Click Pulse
   - Stagger Container for Framer Motion
   ============================================================ */

/* ============================
   SAFETY HELPERS
============================ */
const exists = (el) => el && typeof el.style !== "undefined";

/* ============================
   FADE-IN-UP ANIMATION
============================ */
export const fadeInUp = (element, delay = 0) => {
  if (!exists(element)) return;

  element.style.opacity = 0;
  element.style.transform = "translateY(25px)";

  setTimeout(() => {
    if (!exists(element)) return;

    element.style.transition = "opacity 0.7s ease, transform 0.7s ease";
    element.style.opacity = 1;
    element.style.transform = "translateY(0px)";
  }, delay);
};

/* ============================
   SMOOTH SCALE
============================ */
export const smoothScale = (element) => {
  if (!exists(element)) return;

  element.addEventListener("mouseenter", () => {
    element.style.transition = "transform 0.3s ease";
    element.style.transform = "scale(1.04)";
  });

  element.addEventListener("mouseleave", () => {
    element.style.transform = "scale(1)";
  });
};

/* ============================
   3D HOVER TILT
============================ */
export const hover3D = (element, intensity = 18) => {
  if (!exists(element)) return;

  element.addEventListener("mousemove", (e) => {
    const rect = element.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    const rotateY = x * intensity;
    const rotateX = -y * intensity;

    element.style.transform = `
      perspective(900px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
    `;
  });

  element.addEventListener("mouseleave", () => {
    element.style.transform = `
      perspective(900px)
      rotateX(0deg)
      rotateY(0deg)
    `;
  });
};

/* ============================
   CLICK PULSE
============================ */
export const clickPulse = (element) => {
  if (!exists(element)) return;

  element.addEventListener("click", () => {
    element.style.transform = "scale(0.94)";
    setTimeout(() => {
      if (!exists(element)) return;
      element.style.transform = "scale(1)";
    }, 120);
  });
};

/* ============================
   FRAMER-MOTION STAGGER PRESET
============================ */
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

/* ============================
   MASTER INITIALIZER (Optional)
============================ */
export const MotionEngine = () => {
  console.log(
    "%c MotionEngine Loaded ✔ (VisionOS Motion Physics)",
    "color:#4be28c;font-weight:bold;font-size:14px"
  );
};
