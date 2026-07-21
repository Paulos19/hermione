"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import createGlobe from "cobe"
import { MapPin } from "lucide-react"

export interface StickerMarker {
  id: string
  location: [number, number]
  sticker?: React.ReactNode
}

interface GlobeStickersProps {
  markers?: StickerMarker[]
  className?: string
  speed?: number
  onMarkerClick?: (marker: StickerMarker) => void
}

// Default markers with some demo locations
const defaultMarkers: StickerMarker[] = [
  { id: "sp", location: [-23.55, -46.63] },
  { id: "nyc", location: [40.71, -74.01] },
  { id: "london", location: [51.51, -0.13] },
  { id: "tokyo", location: [35.68, 139.65] },
  { id: "sydney", location: [-33.87, 151.21] },
]

export function GlobeStickers({
  markers = defaultMarkers,
  className = "",
  speed = 0.003,
  onMarkerClick,
}: GlobeStickersProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId: number
    let phi = 0

    function init() {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: 0,
        theta: 0.2,
        dark: 1, // Full dark mode
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 6,
        baseColor: [0.1, 0.1, 0.1],
        markerColor: [1, 1, 1],
        glowColor: [0.1, 0.1, 0.1],
        markerElevation: 0,
        markers: markers.map((m) => ({ location: m.location, size: 0.05, id: m.id })),
        arcs: [],
        arcColor: [0.9, 0.4, 0.7],
        arcWidth: 0.5,
        arcHeight: 0.25,
        opacity: 0.8,
      })
      
      function animate() {
        if (!isPausedRef.current) phi += speed
        globe!.update({
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
        })
        animationId = requestAnimationFrame(animate)
      }
      animate()
      setTimeout(() => canvas && (canvas.style.opacity = "1"))
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [markers, speed])

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%", height: "100%", cursor: "grab", opacity: 0,
          transition: "opacity 1.2s ease", borderRadius: "50%", touchAction: "none",
        }}
      />
      {markers.map((m, i) => (
        <div
          key={m.id}
          onClick={(e) => {
            e.stopPropagation();
            onMarkerClick?.(m);
          }}
          style={{
            position: "absolute",
            positionAnchor: `--cobe-${m.id}`,
            bottom: "anchor(top)",
            left: "anchor(center)",
            translate: "-50% -100%", // Adjust pin upward
            lineHeight: 1,
            pointerEvents: "auto" as const,
            cursor: "pointer",
            opacity: `var(--cobe-visible-${m.id}, 0)`,
            transition: "opacity 0.2s, transform 0.2s",
            color: "white",
            filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
          }}
          className="hover:scale-110 hover:-translate-y-1"
        >
          {m.sticker || <MapPin size={32} className="text-[#B899FF] fill-[#B899FF]/20" strokeWidth={1.5} />}
        </div>
      ))}
    </div>
  )
}
