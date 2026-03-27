/* ============================================================================
   🍏 Vision Pro Spatial Engine (L9)
   FIXED VERSION — now exports initParallax()
   Fully compatible with Dashboard.js + App.js imports
============================================================================ */

/* ---------------------------------------------------
   Smooth Linear Interpolation
--------------------------------------------------- */
function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

/* ===================================================
   🍏 1. MOUSE PARALLAX TILT (Apple Vision Pro)
=================================================== */
export function parallaxTilt(element, intensity = 25, smoothness = 0.08) {
  let xRot = 0, yRot = 0;
  let targetX = 0, targetY = 0;

  function update() {
    xRot = lerp(xRot, targetX, smoothness);
    yRot = lerp(yRot, targetY, smoothness);

    element.style.transform = `
      perspective(900px)
      rotateX(${xRot}deg)
      rotateY(${yRot}deg)
      scale(1.03)
    `;

    requestAnimationFrame(update);
  }
  update();

  element.addEventListener("mousemove", (e) => {
    const rect = element.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    targetY = x * intensity;
    targetX = -y * intensity;
  });

  element.addEventListener("mouseleave", () => {
    targetX = 0;
    targetY = 0;
  });
}

/* ===================================================
   🍏 2. SCROLL PARALLAX (Hero / Video)
=================================================== */
export function applyParallaxScroll(element, speed = 0.4) {
  function onScroll() {
    const offset = window.scrollY * speed;
    element.style.transform = `translateY(${offset}px)`;
  }
  window.addEventListener("scroll", onScroll);
  onScroll();
}

/* ===================================================
   🍏 3. GYROSCOPE PARALLAX (iPhone / Android)
=================================================== */
export function enableGyroParallax(element, intensity = 18) {
  if (!window.DeviceOrientationEvent) return;

  window.addEventListener("deviceorientation", (event) => {
    const { beta, gamma } = event;
    if (beta == null || gamma == null) return;

    const rotateX = (beta / 90) * intensity;
    const rotateY = (gamma / 90) * intensity;

    element.style.transform = `
      perspective(900px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.02)
    `;
  });
}

/* ===================================================
   🍏 4. MULTI-CARD PARALLAX ATTACHER
=================================================== */
export function attachParallaxToCards(selector) {
  const cards = document.querySelectorAll(selector);
  cards.forEach((card) => parallaxTilt(card, 18, 0.06));
}

/* ===================================================
   🍏 5. MASTER INITIALIZER (Fixed Export Name)
=================================================== */
export function initParallax() {
  // 8K UltraHero Section
  const hero = document.querySelector(".ultra-hero");
  if (hero) applyParallaxScroll(hero, 0.25);

  // All Bento / Glass Cards
  attachParallaxToCards(".glass-card, .tilt-3d");

  // Gyro for floating orb
  const orb = document.querySelector(".weather-orb");
  if (orb) enableGyroParallax(orb, 14);

  console.log(
    "%c✔ Vision Pro L9 Parallax Engine Loaded",
    "color:#19c37d;font-size:15px;font-weight:bold"
  );
}
