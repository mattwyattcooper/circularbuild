"use client";

import { useEffect, useRef } from "react";

export function useParallax(speed = 0.3) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let raf = 0;
    const handleScroll = () => {
      raf = requestAnimationFrame(() => {
        const y = window.scrollY * speed;
        if (ref.current) {
          ref.current.style.transform = `translate3d(0, ${y}px, 0)`;
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [speed]);

  return ref;
}
