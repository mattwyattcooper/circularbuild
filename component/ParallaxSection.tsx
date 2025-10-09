"use client";

import Image from "next/image";
import type { ReactNode } from "react";

import { useParallax } from "@/lib/useParallax";

type Props = {
  imageSrc: string;
  imageAlt: string;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  speed?: number;
  maxOffset?: number;
  priority?: boolean;
  imageSizes?: string;
};

export default function ParallaxSection({
  imageSrc,
  imageAlt,
  children,
  className = "",
  overlayClassName,
  speed = 0.18,
  maxOffset = 160,
  priority = false,
  imageSizes = "100vw",
}: Props) {
  const backgroundRef = useParallax({ speed, maxOffset });

  return (
    <section className={`relative isolate w-full overflow-hidden ${className}`}>
      <div
        ref={backgroundRef}
        className="absolute inset-0 -z-10 will-change-transform"
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority={priority}
          sizes={imageSizes}
          className="object-cover"
        />
        {overlayClassName ? (
          <div className={`absolute inset-0 ${overlayClassName}`} />
        ) : null}
      </div>
      <div className="relative">{children}</div>
    </section>
  );
}
