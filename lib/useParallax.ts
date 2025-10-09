"use client";

import { useEffect, useRef } from "react";

type Options = {
  speed?: number;
  maxOffset?: number;
};

export function useParallax({ speed = 0.2, maxOffset }: Options = {}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    let raf = 0;

    const update = () => {
      if (prefersReducedMotion.matches) {
        ref.current?.style.removeProperty("transform");
        return;
      }
      const element = ref.current;
      const container = element?.parentElement;
      if (!element || !container) return;

      const rect = container.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const containerCenter = rect.top + rect.height / 2;
      const offset = containerCenter - viewportCenter;
      const translate = offset * speed;
      const clampedTranslate =
        typeof maxOffset === "number"
          ? Math.max(Math.min(translate, maxOffset), -maxOffset)
          : translate;

      element.style.transform = `translate3d(0, ${clampedTranslate}px, 0)`;
    };

    const handleScroll = () => {
      raf = requestAnimationFrame(update);
    };

    const handleResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    const handlePreferenceChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        cancelAnimationFrame(raf);
        ref.current?.style.removeProperty("transform");
      } else {
        update();
      }
    };

    if (prefersReducedMotion.matches) {
      ref.current?.style.removeProperty("transform");
    } else {
      update();
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    if (typeof prefersReducedMotion.addEventListener === "function") {
      prefersReducedMotion.addEventListener("change", handlePreferenceChange);
    } else {
      prefersReducedMotion.addListener(handlePreferenceChange);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (typeof prefersReducedMotion.removeEventListener === "function") {
        prefersReducedMotion.removeEventListener(
          "change",
          handlePreferenceChange,
        );
      } else {
        prefersReducedMotion.removeListener(handlePreferenceChange);
      }
    };
  }, [speed, maxOffset]);

  return ref;
}
