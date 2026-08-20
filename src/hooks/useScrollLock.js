import { useEffect } from "react";

export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;

    const targets = [
      document.body,
      ...document.querySelectorAll(".overflow-y-auto"),
    ];
    const previous = targets.map((element) => element.style.overflow);
    targets.forEach((element) => {
      element.style.overflow = "hidden";
    });

    return () => {
      targets.forEach((element, index) => {
        element.style.overflow = previous[index];
      });
    };
  }, [active]);
}
