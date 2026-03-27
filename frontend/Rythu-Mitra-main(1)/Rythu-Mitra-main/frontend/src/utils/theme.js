/* ============================================================================
   🍏 Apple Vision Pro L7 Adaptive Theme Engine
   Handles:
   - Auto Dark Mode (macOS / iOS / Windows / Android)
   - Manual toggle override
   - System preference listener
   - LocalStorage persistence
   - Smooth transitions (Apple-like)
   - Global event dispatching for React components
   ============================================================================ */

const THEME_KEY = "rythu-mitra-theme";   // persistent key

// --- Get OS preferred mode ---
export function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

// --- Apply theme to document root ---
export function applyTheme(mode) {
  const root = document.documentElement;

  if (mode === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }

  // Smooth Apple-like fade
  root.style.transition = "background 0.5s ease, color 0.5s ease";

  // Broadcast globally for components (navbar, cards, dashboard)
  window.dispatchEvent(new Event("theme-changed"));
}

// --- Load saved mode OR fallback to system ---
export function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);

  if (saved === "light" || saved === "dark") {
    applyTheme(saved);
    return saved;
  }

  // Default → system mode
  const systemMode = getSystemTheme();
  applyTheme(systemMode);
  return systemMode;
}

// --- Toggle theme manually ---
export function toggleTheme() {
  const current = document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";

  const nextMode = current === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, nextMode);

  applyTheme(nextMode);
  return nextMode;
}

// --- Start real-time OS theme listener ---
export function initSystemThemeWatcher() {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");

  const handler = () => {
    const saved = localStorage.getItem(THEME_KEY);

    // If user manually set a theme → dont auto-switch
    if (saved === "light" || saved === "dark") return;

    // Else update automatically
    applyTheme(getSystemTheme());
  };

  mq.addEventListener("change", handler);
}
