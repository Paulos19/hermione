"use client";

import React, { useRef, useEffect, useState } from "react";
import { useScroll, useTransform, motion, useMotionValueEvent } from "framer-motion";

interface ParticleTransitionCanvasProps {
  className?: string;
  scrollProgress?: any; // framer-motion scroll progress
}

export default function ParticleTransitionCanvas({
  className = "",
  scrollProgress,
}: ParticleTransitionCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<any>(null);
  const [progress, setProgress] = useState(0);

  // Track scroll progress
  useMotionValueEvent(scrollProgress, "change", (latest: number) => {
    setProgress(latest);
    if (orbRef.current) {
      orbRef.current.setProgress(latest);
    }
  });

  useEffect(() => {
    if (!containerRef.current) return;

    let mounted = true;

    const initTransition = async () => {
      try {
        const { ParticleTransition } = await import("./ParticleTransition");

        if (!mounted || !containerRef.current) return;

        orbRef.current = new ParticleTransition({
          container: containerRef.current,
          particleCount: 3000,
          width: 12,
          height: 6,
        });
      } catch (error) {
        console.error("Failed to initialize ParticleTransition:", error);
      }
    };

    initTransition();

    return () => {
      mounted = false;
      if (orbRef.current) {
        orbRef.current.dispose();
        orbRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full pointer-events-none ${className}`}
      style={{ background: "transparent" }}
    />
  );
}
