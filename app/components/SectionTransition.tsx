"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface SectionTransitionProps {
  children: React.ReactNode;
  className?: string;
  parallaxOffset?: number;
  fadeIn?: boolean;
  slideUp?: boolean;
}

export default function SectionTransition({
  children,
  className = "",
  parallaxOffset = 50,
  fadeIn = true,
  slideUp = true,
}: SectionTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [parallaxOffset, 0, 0, -parallaxOffset / 2]
  );

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.85, 1],
    [fadeIn ? 0 : 1, 1, 1, fadeIn ? 0 : 1]
  );

  return (
    <motion.div
      ref={ref}
      style={{
        y: slideUp ? y : 0,
        opacity,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
