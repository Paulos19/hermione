"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Cormorant_Garamond, Geist } from "next/font/google";
import { GlobeStickers, StickerMarker } from "./ui/cobe-globe-stickers";
import { Users, ChevronLeft, ChevronRight, X, Sparkles, User as UserIcon, ArrowDown, ArrowRight } from "lucide-react";
import { getCommunityUsersAction } from "../actions/user";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geist = Geist({
  subsets: ["latin"],
});

const METRICS_DATA = [
  { key: "activeUsers", label: "Usuários Ativos", suffix: "" },
  { key: "chapters", label: "Capítulos", suffix: "+" },
  { key: "words", label: "Palavras", suffix: "M" },
  { key: "subscribers", label: "Autores Premium", suffix: "" },
];

export default function MetricsSection({ dict }: { dict?: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeMetric, setActiveMetric] = useState(0);

  const metricsLabels = (dict?.metricsSection?.metrics || METRICS_DATA).map((m: any, i: number) => ({
    key: METRICS_DATA[i]?.key || `metric-${i}`,
    label: m.label,
    suffix: m.suffix
  }));

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

  const bgTextY = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const contentOpacity = useTransform(scrollYProgress, [0.1, 0.4], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0.1, 0.4], [40, 0]);

  useEffect(() => {
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const getMetricValue = (key: string) => {
    const value = metrics[key as keyof typeof metrics] || 0;
    return formatNumber(value);
  };

  return (
    <section id="metrics" ref={containerRef} className="relative w-full min-h-[100vh] bg-[#030303] overflow-hidden">

      {/* Large Decorative Background Text */}
      <motion.div
        style={{ y: bgTextY }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
      >
        <span className="text-[180px] sm:text-[250px] md:text-[320px] lg:text-[400px] font-bold text-white/[0.015] uppercase leading-none whitespace-nowrap font-[family-name:var(--font-cormorant-garamond)] italic">
          COMUNIDADE
        </span>
      </motion.div>

      {/* Main Content */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 h-screen flex flex-col justify-center"
      >

        {/* Top Bar */}
        <div className="absolute top-8 left-6 sm:left-10 lg:left-16 right-6 sm:right-10 lg:right-16 flex items-center justify-between z-20">
          {/* Left - Grid icon */}
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-white/40" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </div>

          {/* Center - Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {["Sobre", "Métricas", "Comunidade"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-[10px] font-medium tracking-[0.2em] text-white/40 hover:text-white/70 transition-colors uppercase"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Right - Social */}
          <div className="flex items-center gap-4">
            {["Twitter", "Instagram", "GitHub"].map((social) => (
              <a
                key={social}
                href="#"
                className="text-[9px] font-medium tracking-[0.15em] text-white/30 hover:text-white/60 transition-colors uppercase hidden sm:block"
              >
                {social}
              </a>
            ))}
          </div>
        </div>

        {/* Center Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Left Side - Typography Size Selector */}
          <div className="hidden lg:flex lg:col-span-1 flex-col items-center gap-4">
            {[16, 8, 4, 2].map((size) => (
              <span
                key={size}
                className={`${cormorant.className} text-white/20 hover:text-white/50 transition-colors cursor-default`}
                style={{ fontSize: `${size * 4}px` }}
              >
                A
              </span>
            ))}
          </div>

          {/* Left Content - Metrics */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            {/* Section Label */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3"
            >
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-[#E84855]' : 'bg-white/20'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-[#E84855]' : 'bg-white/40'}`}></span>
              </span>
              <span className="text-white/40 font-medium tracking-[0.3em] text-[10px] uppercase">
                {dict?.metricsSection?.tag || "Rede Global"}
              </span>
            </motion.div>

            {/* Main Title */}
            <div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-[11px] font-medium tracking-[0.25em] text-white/40 uppercase mb-2"
              >
                {dict?.metricsSection?.titlePrefix || "SHE MOVES IN"}
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={`${cormorant.className} text-[48px] sm:text-[56px] lg:text-[64px] leading-[0.95] font-light text-white/90`}
              >
                {dict?.metricsSection?.title || "Mysterious"}
              </motion.h2>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className={`${cormorant.className} text-[52px] sm:text-[60px] lg:text-[68px] leading-[0.95] font-bold text-[#E84855] italic`}
              >
                {dict?.metricsSection?.titleAccent || "Ways"}
              </motion.h2>
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:border-white/40 hover:text-white/70 transition-colors cursor-pointer">
                <ArrowDown className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.25em] text-white/50 uppercase">
                {dict?.metricsSection?.cta || "VER MÉTRICAS"}
              </span>
            </motion.div>
          </div>

          {/* Center - Globe 3D */}
          <div className="lg:col-span-5 relative flex items-center justify-center py-8">
            <div className="absolute inset-0 bg-gradient-radial from-[#E84855]/5 to-transparent opacity-30 blur-[80px] rounded-full" />
            <GlobeStickers
              markers={markers}
              className="w-full max-w-[400px] lg:max-w-[500px]"
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
                  className="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/[0.06] rounded-lg p-4 shadow-[0_8px_32px_rgba(0,0,0,0.8)] flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-white/80 font-medium text-xs flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#E84855]" />
                      {dict?.metricsSection?.connected || "Conectados"}
                    </h3>
                    <button onClick={() => setIsDropdownOpen(false)} className="text-white/40 hover:text-white transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    {randomUsers.map((user, i) => (
                      <div key={user.id || i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden shrink-0 border border-white/5">
                          {user.image ? (
                            <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <UserIcon className="w-4 h-4 text-white/50" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-white text-xs font-medium truncate">{user.name}</span>
                          <span className="text-white/30 text-[10px] truncate">{user.email}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleOpenTable}
                    className="w-full py-2 mt-1 bg-white/5 hover:bg-white/10 transition-colors rounded text-white text-xs font-medium flex items-center justify-center gap-2"
                  >
                    <Users className="w-3.5 h-3.5" />
                    {dict?.metricsSection?.viewCommunity || "Ver Comunidade"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side - Metrics Display */}
          <div className="lg:col-span-2 flex flex-col items-end gap-6">
            {/* Number Indicators */}
            <div className="flex flex-col items-center gap-3">
              {[0, 1, 2].map((num) => (
                <button
                  key={num}
                  onClick={() => setActiveMetric(num)}
                  className={`text-[9px] font-mono transition-colors ${
                    activeMetric === num ? "text-[#E84855]" : "text-white/20 hover:text-white/40"
                  }`}
                >
                  {String(num + 1).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Bar - Metrics Cards */}
        <div className="absolute bottom-8 left-6 sm:left-10 lg:left-16 right-6 sm:right-10 lg:right-16 z-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {metricsLabels.map((metric: any, i: number) => (
              <motion.div
                key={metric.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className={`p-4 border transition-all duration-300 cursor-pointer ${
                  activeMetric === i
                    ? "bg-white/[0.03] border-[#E84855]/30"
                    : "bg-transparent border-white/[0.04] hover:border-white/10"
                }`}
                onClick={() => setActiveMetric(i)}
              >
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-[10px] font-bold text-white/30 tracking-wider">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-white/20">/</span>
                  <span className="text-[10px] text-white/20">
                    {String(metricsLabels.length).padStart(2, '0')}
                  </span>
                </div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                  {metric.label}
                </p>
                <p className={`${cormorant.className} text-2xl md:text-3xl text-white/90 font-light tabular-nums`}>
                  {getMetricValue(metric.key)}
                  <span className="text-[#E84855] text-lg">{metric.suffix}</span>
                </p>
              </motion.div>
            ))}
          </div>

          {/* Bottom Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.04]">
            <div className="flex items-center gap-4">
              <button className="text-white/30 hover:text-white/60 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="text-white/30 hover:text-white/60 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase">
                {dict?.metricsSection?.share || "COMPARTILHAR"}
              </span>
              <div className="w-[1px] h-3 bg-white/10" />
              <button className="text-white/30 hover:text-white/60 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>

      </motion.div>

      {/* Community Modal */}
      <AnimatePresence>
        {isTableModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-4xl bg-[#0A0A0A] border border-white/[0.06] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-white/[0.04] flex items-center justify-between">
                <div>
                  <h2 className={`${cormorant.className} text-xl text-white font-medium flex items-center gap-3`}>
                    <Users className="w-5 h-5 text-[#E84855]" />
                    {dict?.metricsSection?.communityTitle || "Comunidade Hermione"}
                  </h2>
                  <p className="text-white/30 text-xs mt-1">{dict?.metricsSection?.communitySubtitle || "Rede global de autores e criadores."}</p>
                </div>
                <button
                  onClick={() => setIsTableModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-6">
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#E84855]"></div>
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr>
                          <th className="pb-3 font-medium text-white/30 text-[10px] uppercase tracking-wider border-b border-white/[0.04]">{dict?.metricsSection?.author || "Autor"}</th>
                          <th className="pb-3 font-medium text-white/30 text-[10px] uppercase tracking-wider border-b border-white/[0.04]">{dict?.metricsSection?.status || "Status"}</th>
                          <th className="pb-3 font-medium text-white/30 text-[10px] uppercase tracking-wider border-b border-white/[0.04] text-right">{dict?.metricsSection?.memberSince || "Membro desde"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableUsers.map((user, idx) => (
                          <tr key={user.id || idx} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 border-b border-white/[0.03]">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/5 overflow-hidden shrink-0 border border-white/[0.06]">
                                  {user.image ? (
                                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <UserIcon className="w-4 h-4 text-white/30" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-white text-xs font-medium">{user.name}</span>
                                  <span className="text-white/30 text-[10px]">{user.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 border-b border-white/[0.03]">
                              {user.isPremium ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#E84855]/10 text-[#E84855] text-[10px] font-medium">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  Premium
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded bg-white/5 text-white/40 text-[10px] font-medium">
                                  Free
                                </span>
                              )}
                            </td>
                            <td className="py-3 border-b border-white/[0.03] text-right text-white/40 text-xs">
                              {new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/[0.04] flex items-center justify-between">
                <span className="text-white/30 text-xs">
                  {dict?.metricsSection?.page || "Página"} {currentPage} / {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchTablePage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || isLoadingUsers}
                    className="p-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors rounded"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => fetchTablePage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || isLoadingUsers}
                    className="p-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors rounded"
                  >
                    <ChevronRight className="w-4 h-4" />
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
