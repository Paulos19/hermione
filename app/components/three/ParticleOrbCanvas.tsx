"use client";

import React, { useRef, useEffect, useState } from "react";

interface ParticleOrbCanvasProps {
  className?: string;
}

export default function ParticleOrbCanvas({ className = "" }: ParticleOrbCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let mounted = true;

    const initOrb = async () => {
      try {
        const { ParticleOrb } = await import("./ParticleOrb");

        if (!mounted || !containerRef.current) return;

        orbRef.current = new ParticleOrb({
          container: containerRef.current,
          particleCount: 70000,
          atmosphereCount: 500,
          radius: 2.5,
          cameraZ: 7,
          fov: 45,
          bloomStrength: 2.5,
          bloomRadius: 0.9,
          bloomThreshold: 0.1,
          rotationSpeedY: 0.06,
          rotationSpeedX: 0.015,
          breathingAmplitude: 1.0,
          background: 0x030303,
        });

        if (mounted) setIsLoaded(true);
      } catch (error) {
        console.error("Failed to initialize ParticleOrb:", error);
      }
    };

    initOrb();

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
      className={`w-full h-full ${className}`}
      style={{ background: "#030303" }}
    />
  );
}
