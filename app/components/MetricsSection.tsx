"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Cormorant_Garamond } from "next/font/google";
import { GlobeStickers, StickerMarker } from "./ui/cobe-globe-stickers";
import { Users, ChevronLeft, ChevronRight, X, Sparkles, User as UserIcon } from "lucide-react";
import { getCommunityUsersAction } from "../actions/user";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export default function MetricsSection({ dict }: { dict?: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Real-time state
  const [metrics, setMetrics] = useState({
    activeUsers: 1,
    chapters: 0,
    words: 0,
    subscribers: 0,
  });
  const [markers, setMarkers] = useState<StickerMarker[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Globe Interaction States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [randomUsers, setRandomUsers] = useState<any[]>([]);
  
  const [tableUsers, setTableUsers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const handleGlobeClick = async () => {
    if (!isDropdownOpen) {
      setIsDropdownOpen(true);
      if (randomUsers.length === 0) {
        const res = await getCommunityUsersAction(1, 3, true);
        setRandomUsers(res.users || []);
      }
    } else {
      setIsDropdownOpen(false);
    }
  };

  const handleOpenTable = async () => {
    setIsDropdownOpen(false);
    setIsTableModalOpen(true);
    if (tableUsers.length === 0) {
      fetchTablePage(1);
    }
  };

  const fetchTablePage = async (page: number) => {
    setIsLoadingUsers(true);
    const res = await getCommunityUsersAction(page, 8, false);
    setTableUsers(res.users || []);
    setTotalPages(res.totalPages || 1);
    setCurrentPage(page);
    setIsLoadingUsers(false);
  };

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
    // 1. Fetch initial real DB metrics & user location
    let userLocation: [number, number] | null = null;

    fetch("/api/metrics")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setMetrics((prev) => ({
            ...prev,
            chapters: data.chapters || prev.chapters,
            words: data.words || prev.words,
            subscribers: data.subscribers || prev.subscribers,
            activeUsers: data.activeUsers || prev.activeUsers,
          }));
          if (Array.isArray(data.locations) && data.locations.length > 0) {
            setMarkers(
              data.locations.map((loc: [number, number], i: number) => ({
                id: `user-${i}`,
                location: loc,
              }))
            );
          }
        }
      })
      .catch(() => {});

    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data.latitude && data.longitude) {
          userLocation = [data.latitude, data.longitude];
        }
      })
      .catch(() => {});

    // 2. Connect to WebSocket with wss auto-upgrade
    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;

    const connectWebSocket = () => {
      const rawWsUrl = process.env.NEXT_PUBLIC_WS_URL || "wss://services-websckt.khdya3.easypanel.host";
      let targetUrl = rawWsUrl;
      if (typeof window !== "undefined" && window.location.protocol === "https:" && targetUrl.startsWith("ws://")) {
        targetUrl = targetUrl.replace("ws://", "wss://");
      }
      const wsEndpoint = targetUrl.endsWith("/ws/metrics") ? targetUrl : `${targetUrl.replace(/\/$/, "")}/ws/metrics`;

      try {
        ws = new WebSocket(wsEndpoint);

        ws.onopen = () => {
          setIsConnected(true);
          if (userLocation) {
            ws?.send(JSON.stringify({ type: "location", location: userLocation }));
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
                  location: loc,
                }));
                setMarkers(newMarkers);
              }
            }
          } catch (err) {
            console.error("Erro ao processar dados do WS de métricas", err);
          }
        };

        ws.onerror = () => {
          setIsConnected(false);
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Try reconnecting in 5s
          reconnectTimer = setTimeout(connectWebSocket, 5000);
        };
      } catch (err) {
        console.error("Erro ao conectar WebSocket de métricas:", err);
        setIsConnected(false);
        reconnectTimer = setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) ws.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
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
                {dict?.metricsSection?.tag || "Rede Neural Global"}
              </span>
            </div>
            
            <h2 className={`${cormorant.className} text-5xl md:text-6xl lg:text-7xl text-white font-light tracking-wide leading-tight`}>
              {dict?.metricsSection?.title || "Escrevendo a história"} <br/>
              <span className="text-white/40 italic">{dict?.metricsSection?.together || "juntos."}</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-8 md:gap-12 pt-8 border-t border-white/10">
            {/* Metric 1 */}
            <div className="flex flex-col gap-2">
              <span className="text-white/50 font-light text-sm uppercase tracking-widest">{dict?.metricsSection?.activeUsersLabel || "Usuários Conectados"}</span>
              <span className="text-4xl md:text-5xl text-white font-light tabular-nums">
                {formatNumber(metrics.activeUsers)}
              </span>
            </div>

            {/* Metric 2 */}
            <div className="flex flex-col gap-2">
              <span className="text-white/50 font-light text-sm uppercase tracking-widest">{dict?.metricsSection?.chaptersLabel || "Capítulos Escritos"}</span>
              <span className="text-4xl md:text-5xl text-white font-light tabular-nums">
                {formatNumber(metrics.chapters)}
              </span>
            </div>

            {/* Metric 3 */}
            <div className="flex flex-col gap-2">
              <span className="text-white/50 font-light text-sm uppercase tracking-widest">{dict?.metricsSection?.wordsLabel || "Palavras Geradas"}</span>
              <span className="text-4xl md:text-5xl text-white font-light tabular-nums">
                {formatNumber(metrics.words)}
              </span>
            </div>

            {/* Metric 4 */}
            <div className="flex flex-col gap-2">
              <span className="text-white/50 font-light text-sm uppercase tracking-widest">{dict?.metricsSection?.subscribersLabel || "Autores Premium"}</span>
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
            onMarkerClick={handleGlobeClick}
          />

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-white/80 font-medium text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#B899FF]" />
                    Conectados Recentemente
                  </h3>
                  <button onClick={() => setIsDropdownOpen(false)} className="text-white/40 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {randomUsers.map((user, i) => (
                    <div key={user.id || i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden shrink-0 border border-white/5">
                        {user.image ? (
                          <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-white/50" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-white text-sm font-medium truncate">{user.name}</span>
                        <span className="text-white/40 text-xs truncate">{user.email}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleOpenTable}
                  className="w-full py-2.5 mt-2 bg-white/10 hover:bg-white/20 transition-colors rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Mostrar Comunidade Completa
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {isTableModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-4xl bg-[#0A0D12] border border-white/10 rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div>
                  <h2 className="text-2xl font-serif text-white font-medium flex items-center gap-3">
                    <Users className="w-6 h-6 text-[#B899FF]" />
                    Comunidade Hermione
                  </h2>
                  <p className="text-white/40 text-sm mt-1">Explorando a rede global de autores e criadores.</p>
                </div>
                <button 
                  onClick={() => setIsTableModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-6 md:p-8">
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B899FF]"></div>
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr>
                          <th className="pb-4 font-medium text-white/40 text-sm uppercase tracking-wider border-b border-white/5">Autor</th>
                          <th className="pb-4 font-medium text-white/40 text-sm uppercase tracking-wider border-b border-white/5">Status</th>
                          <th className="pb-4 font-medium text-white/40 text-sm uppercase tracking-wider border-b border-white/5 text-right">Membro desde</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableUsers.map((user, idx) => (
                          <tr key={user.id || idx} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 border-b border-white/5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden shrink-0 border border-white/10">
                                  {user.image ? (
                                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <UserIcon className="w-5 h-5 text-white/30" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-white text-sm font-medium">{user.name}</span>
                                  <span className="text-white/40 text-xs">{user.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 border-b border-white/5">
                              {user.isPremium ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#B899FF]/10 text-[#B899FF] text-xs font-medium border border-[#B899FF]/20">
                                  <Sparkles className="w-3 h-3" />
                                  Premium
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/5 text-white/50 text-xs font-medium border border-white/5">
                                  Free
                                </span>
                              )}
                            </td>
                            <td className="py-4 border-b border-white/5 text-right text-white/50 text-sm">
                              {new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-white/5 flex items-center justify-between bg-white/[0.02]">
                <span className="text-white/40 text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => fetchTablePage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || isLoadingUsers}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => fetchTablePage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || isLoadingUsers}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
