import { useLayoutEffect, useRef } from "react";

const MASS = 1;
const STIFFNESS = 100;
const DAMPING = 18.5;

const OMEGA0 = Math.sqrt(STIFFNESS / MASS);
const ZETA = DAMPING / (2 * Math.sqrt(STIFFNESS * MASS));
const OMEGA_D = OMEGA0 * Math.sqrt(1 - ZETA * ZETA);
const SETTLE_SEC = 1.2;

function springProgress(t) {
  const decay = Math.exp(-ZETA * OMEGA0 * t);
  return (
    1 -
    decay *
      (Math.cos(OMEGA_D * t) +
        ((ZETA * OMEGA0) / OMEGA_D) * Math.sin(OMEGA_D * t))
  );
}

export function useSlideUp(enabled = true) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    el.style.transform = "translateY(100%)";
    el.style.willChange = "transform";

    let rafId = null;
    const start = performance.now();

    const tick = (now) => {
      const t = (now - start) / 1000;
      if (t >= SETTLE_SEC) {
        el.style.transform = "";
        el.style.willChange = "";
        return;
      }
      el.style.transform = `translateY(${(1 - springProgress(t)) * 100}%)`;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [enabled]);

  return ref;
}
