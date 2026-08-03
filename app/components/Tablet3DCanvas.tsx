"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createTablet3DModel, ProceduralModelResult } from "./Tablet3DModel";

interface Tablet3DCanvasProps {
  className?: string;
  onResetRotation?: () => void;
}

export default function Tablet3DCanvas({
  className = ""
}: Tablet3DCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelResultRef = useRef<ProceduralModelResult | null>(null);

  // Rotation states for 360 degree drag-to-rotate
  const rotationRef = useRef({ x: 0.1, y: -0.2, z: 0 });
  const targetRotationRef = useRef({ x: 0.1, y: -0.2, z: 0 });
  const isDraggingRef = useRef(false);
  const previousPointerPositionRef = useRef({ x: 0, y: 0 });
  
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();

    // 2. Camera Setup
    const width = container.clientWidth || 420;
    const height = container.clientHeight || 600;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.appendChild(renderer.domElement);

    // 4. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(5, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xb899ff, 1.8);
    fillLight.position.set(-5, -2, 4);
    scene.add(fillLight);

    const rimLight = new THREE.SpotLight(0xffffff, 3.5);
    rimLight.position.set(0, 6, -4);
    scene.add(rimLight);

    // 5. Create Procedural Tablet Model
    const modelResult = createTablet3DModel({
      width: 3.3,
      height: 4.7,
      depth: 0.12,
      radius: 0.28
    });
    modelResultRef.current = modelResult;
    scene.add(modelResult.group);

    // Initial position adjustment
    modelResult.group.position.set(0, 0, 0);

    // Pointer Drag Handlers (Rotate 3D in Pitch, Yaw, Roll)
    const handlePointerDown = (e: PointerEvent) => {
      // Only initiate 3D canvas drag if target is the canvas itself or frame edge
      isDraggingRef.current = true;
      setIsInteracting(true);
      previousPointerPositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - previousPointerPositionRef.current.x;
      const deltaY = e.clientY - previousPointerPositionRef.current.y;

      // Sensitivity factor for 3D rotation
      const deltaRotationY = deltaX * 0.008;
      const deltaRotationX = deltaY * 0.008;

      targetRotationRef.current.y += deltaRotationY;
      // Clamp pitch between -1.2 and 1.2 radians to prevent flip upside down
      targetRotationRef.current.x = Math.max(-1.2, Math.min(1.2, targetRotationRef.current.x + deltaRotationX));

      previousPointerPositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      setTimeout(() => setIsInteracting(false), 800);
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // 6. Animation Loop with Damping/Lerp
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Lerp current rotation towards target
      if (modelResult.group) {
        rotationRef.current.x = THREE.MathUtils.lerp(rotationRef.current.x, targetRotationRef.current.x, 0.08);
        rotationRef.current.y = THREE.MathUtils.lerp(rotationRef.current.y, targetRotationRef.current.y, 0.08);
        rotationRef.current.z = THREE.MathUtils.lerp(rotationRef.current.z, targetRotationRef.current.z, 0.08);

        modelResult.group.rotation.x = rotationRef.current.x;
        modelResult.group.rotation.y = rotationRef.current.y;
        modelResult.group.rotation.z = rotationRef.current.z;
      }

      // Idle float animation
      if (modelResult.tick) {
        modelResult.tick(delta, elapsed);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("resize", handleResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      modelResult.dispose();
      renderer.dispose();
    };
  }, []);

  const handleReset = () => {
    targetRotationRef.current = { x: 0.1, y: -0.2, z: 0 };
  };

  return (
    <div className="relative w-full h-full group">
      <div
        ref={containerRef}
        className={`relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing ${className}`}
      />

      {/* Control Hint & Reset Overlay Badge */}
      <div className="absolute bottom-2 right-2 z-30 flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={handleReset}
          className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-white/70 hover:text-white hover:bg-black/80 transition-colors shadow-lg"
          title="Resetar Posição 3D"
        >
          Reset 3D
        </button>
        <div className={`px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-white/60 font-mono transition-opacity duration-300 ${isInteracting ? 'opacity-100 text-[#B899FF]' : 'opacity-40 group-hover:opacity-80'}`}>
          ✦ Drag to rotate
        </div>
      </div>
    </div>
  );
}
