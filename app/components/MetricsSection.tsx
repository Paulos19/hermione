"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Cormorant_Garamond } from "next/font/google";
import { GlobeStickers, StickerMarker } from "./ui/cobe-globe-stickers";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

// A local default fallback in case WS is down or before connection
const defaultMarkers: StickerMarker[] = [
  { id: "br", location: [-23.55, -46.63] }, // SP
  { id: "us", location: [40.71, -74.01] },  // NY
  { id: "uk", location: [51.51, -0.13] },   // London
];

export default function MetricsSection({ dict }: { dict?: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Real-time state
  const [metrics, setMetrics] = useState({
    activeUsers: 1,
    chapters: 0,
    words: 0,
    subscribers: 0,
  });
  const [markers, setMarkers] = useState<StickerMarker[]>(defaultMarkers);
  const [isConnected, setIsConnected] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Fade from transparent to black when scrolling into view
  const bgOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  // Fade in content
  const contentOpacity = useTransform(scrollYProgress, [0.1, 0.4], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0.1, 0.4], [50, 0]);

  useEffect(() => {
    // 1. Fetch user location
    let userLocation: [number, number] | null = null;
    
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
        if (data.latitude && data.longitude) {
          userLocation = [data.latitude, data.longitude];
        }
      })
      .catch(err => console.log("Não foi possível obter a localização do IP"));

    // 2. Connect to WebSocket
    // Substituir pela URL do servidor WS em produção se necessário
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
    const ws = new WebSocket(`${WS_URL}/ws/metrics`);

    ws.onopen = () => {
      setIsConnected(true);
      if (userLocation) {
        ws.send(JSON.stringify({ type: "location", location: userLocation }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "metrics_update" && payload.data) {
          setMetrics({
            activeUsers: payload.data.activeUsers || 1,
            chapters: payload.data.chapters || 0,
            words: payload.data.words || 0,
            subscribers: payload.data.subscribers || 0,
          });

          if (payload.data.locations && payload.data.locations.length > 0) {
            const newMarkers = payload.data.locations.map((loc: [number, number], index: number) => ({
              id: `user-${index}`,
              location: loc
            }));
            setMarkers(newMarkers);
          }
        }
      } catch (err) {
        console.error("Erro ao processar dados do WS de métricas", err);
      }
    };

    ws.onclose = () => setIsConnected(false);

    return () => {
      ws.close();
    };
  }, []);

  // Utilidade para formatar números grandes
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  return (
    <section ref={containerRef} className="relative w-full min-h-screen px-4 md:px-6 lg:px-8 pt-[140px] pb-12 flex flex-col items-center justify-center overflow-hidden">
      {/* Black Background Overlay that fades in */}
      <motion.div 
        className="fixed inset-0 pointer-events-none bg-[#050505] z-0"
        style={{ opacity: bgOpacity }}
      />
      
      {/* Container principal para combinar com o estilo de card da sessão anterior */}
      <motion.div 
        className="w-full max-w-[1440px] flex-1 h-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center rounded-[32px] overflow-hidden"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        {/* Left Column: Typography & Metrics */}
        <div className="flex flex-col gap-12">
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-green-400' : 'bg-white/20'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-green-500' : 'bg-white/40'}`}></span>
              </span>
              <span className="text-white/60 font-light tracking-widest text-sm uppercase">
                Rede Neural Global
              </span>
            </div>
            
            <h2 className={`${cormorant.className} text-5xl md:text-6xl lg:text-7xl text-white font-light tracking-wide leading-tight`}>
              Escrevendo a história <br/>
              <span className="text-white/40 italic">juntos.</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-8 md:gap-12 pt-8 border-t border-white/10">
            {/* Metric 1 */}
            <div className="flex flex-col gap-2">
              <span className="text-white/50 font-light text-sm uppercase tracking-widest">Usuários Conectados</span>
              <span className="text-4xl md:text-5xl text-white font-light tabular-nums">
                {formatNumber(metrics.activeUsers)}
              </span>
            </div>

            {/* Metric 2 */}
            <div className="flex flex-col gap-2">
              <span className="text-white/50 font-light text-sm uppercase tracking-widest">Capítulos Escritos</span>
              <span className="text-4xl md:text-5xl text-white font-light tabular-nums">
                {formatNumber(metrics.chapters)}
              </span>
            </div>

            {/* Metric 3 */}
            <div className="flex flex-col gap-2">
              <span className="text-white/50 font-light text-sm uppercase tracking-widest">Palavras Geradas</span>
              <span className="text-4xl md:text-5xl text-white font-light tabular-nums">
                {formatNumber(metrics.words)}
              </span>
            </div>

            {/* Metric 4 */}
            <div className="flex flex-col gap-2">
              <span className="text-white/50 font-light text-sm uppercase tracking-widest">Autores Premium</span>
              <span className="text-4xl md:text-5xl text-white font-light tabular-nums">
                {formatNumber(metrics.subscribers)}
              </span>
            </div>
          </div>
          
        </div>

        {/* Right Column: Globe 3D */}
        <div className="relative w-full flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-radial from-white/5 to-transparent opacity-50 blur-3xl rounded-full" />
          <GlobeStickers 
            markers={markers} 
            className="w-full max-w-[500px] lg:max-w-[600px]" 
            speed={0.002}
          />
        </div>
      </motion.div>

    </section>
  );
}
