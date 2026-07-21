"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, ShieldCheck, Cpu, Radio } from "lucide-react";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" strokeWidth="2" />
      <circle cx="4" cy="4" r="2" strokeWidth="2" />
    </svg>
  );
}

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geist = Geist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

interface StreamLine {
  id: string;
  user: string;
  chapter: string;
  action: string;
  top: number; // percentage
  left: number; // percentage
  speed: number;
}

export default function FooterSection({ dict }: { dict?: any }) {
  const params = useParams();
  const currentLang = (params?.lang as string) || "pt";
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [dbMetrics, setDbMetrics] = useState({ chapters: 0, words: 0, subscribers: 0 });
  const [recentActivities, setRecentActivities] = useState<{ user: string; chapter: string; action: string }[]>([]);

  // Dynamic live stream lines for typing background
  const [streamLines, setStreamLines] = useState<StreamLine[]>([]);
  const [typingState, setTypingState] = useState<{ [key: string]: string }>({});

  // 1. Mouse tracking for interactive spotlight
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // 2. Fetch real initial DB metrics
  useEffect(() => {
    fetch("/api/metrics")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setDbMetrics({
            chapters: data.chapters || 0,
            words: data.words || 0,
            subscribers: data.subscribers || 0,
          });
          if (Array.isArray(data.recentActivity) && data.recentActivity.length > 0) {
            setRecentActivities(data.recentActivity);
          }
        }
      })
      .catch(() => {});
  }, []);

  // 3. WebSocket connection setup for real-time metrics
  useEffect(() => {
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(`${WS_URL}/ws/metrics`);
      ws.onopen = () => {
        setIsConnected(true);
      };
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "metrics_update" && payload.data) {
            if (payload.data.activeUsers !== undefined) {
              setActiveUsersCount(payload.data.activeUsers);
            }
            if (payload.data.chapters !== undefined) {
              setDbMetrics((prev) => ({
                ...prev,
                chapters: payload.data.chapters,
                words: payload.data.words ?? prev.words,
                subscribers: payload.data.subscribers ?? prev.subscribers,
              }));
            }
            if (Array.isArray(payload.data.recentActivity) && payload.data.recentActivity.length > 0) {
              setRecentActivities(payload.data.recentActivity);
            }
          }
        } catch (err) {
          // ignore
        }
      };
      ws.onerror = () => setIsConnected(false);
      ws.onclose = () => setIsConnected(false);
    } catch (e) {
      setIsConnected(false);
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  // 4. Update stream lines from real recent activities
  useEffect(() => {
    if (recentActivities.length === 0) return;

    const lines: StreamLine[] = recentActivities.map((act, i) => ({
      id: `stream-${i}`,
      user: act.user,
      chapter: act.chapter,
      action: act.action,
      top: 12 + i * 14,
      left: (i * 15) % 60 + 5,
      speed: 40,
    }));
    setStreamLines(lines);
  }, [recentActivities]);

  // 5. Typewriter effect for live background streams
  useEffect(() => {
    if (streamLines.length === 0) return;

    const interval = setInterval(() => {
      setTypingState((prev) => {
        const nextState = { ...prev };

        streamLines.forEach((line) => {
          const fullText = `${line.user} • ${line.chapter} ${line.action}`;
          const currentTyped = prev[line.id] || "";

          if (currentTyped.length < fullText.length) {
            nextState[line.id] = fullText.slice(0, currentTyped.length + 1);
          }
        });

        return nextState;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [streamLines]);

  return (
    <footer
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="relative w-full min-h-screen bg-[#020203] text-white overflow-hidden flex flex-col justify-between pt-20 pb-10 px-6 md:px-16 selection:bg-white/30 border-t border-white/5"
    >
      {/* Interactive Mouse Spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-700"
        animate={{ opacity: isHovering ? 1 : 0 }}
        style={{
          background: `radial-gradient(750px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.035), transparent 45%)`,
        }}
      />

      {/* Background Subtle Tech Grid */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:120px_120px] pointer-events-none" />

      {/* ================= WEBSOCKET LIVE TYPING BACKGROUND ================= */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30 select-none">
        {streamLines.map((line) => {
          const text = typingState[line.id] || "";
          return (
            <div
              key={line.id}
              className={`absolute ${geistMono.className} text-xs md:text-sm text-white/40 font-mono flex items-center whitespace-nowrap tracking-wider`}
              style={{ top: `${line.top}%`, left: `${line.left}%` }}
            >
              <span className="text-emerald-400/70 mr-2">⚡ [LIVE_FEED]</span>
              <span>{text}</span>
              <span className="w-1.5 h-4 bg-emerald-400/90 ml-1 inline-block animate-pulse" />
            </div>
          );
        })}
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col justify-between h-full flex-grow gap-16">
        
        {/* Top Bar: WebSocket Status Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isConnected ? "bg-emerald-400" : "bg-amber-400"} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? "bg-emerald-500" : "bg-amber-500"}`} />
            </span>
            <span className={`${geistMono.className} text-xs uppercase tracking-widest text-white/80 font-medium`}>
              {isConnected
                ? `WebSocket Online (${activeUsersCount} Conectados) • ${dbMetrics.chapters} Capítulos (${dbMetrics.words.toLocaleString()} Palavras)`
                : `WebSocket Standby • ${dbMetrics.chapters} Capítulos Registrados`}
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-white/50 tracking-wider uppercase font-medium">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-white/70" /> Encriptação E2E</span>
            <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-white/70" /> Yjs CRDT Engine</span>
            <span className="flex items-center gap-1.5"><Radio className="w-4 h-4 text-emerald-400" /> Servidor VPS Ativo</span>
          </div>
        </div>

        {/* Center CTA Box & Brand Statement */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-6">
          <div className="lg:col-span-7 flex flex-col items-start gap-6">
            <h2 className={`${cormorant.className} text-4xl md:text-6xl font-light text-white leading-tight tracking-wide`}>
              {dict?.footer?.ctaTitle || "Pronto para dar vida à sua história?"}
            </h2>
            <p className={`${geist.className} text-base md:text-lg text-white/60 font-light max-w-xl leading-relaxed`}>
              {dict?.footer?.ctaSubtitle || "Junte-se a milhares de autores que utilizam a Hermione para organizar, escrever e colaborar em obras-primas com o poder da inteligência artificial."}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href={`/${currentLang}/register`}>
                <button className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center gap-3 text-sm md:text-base group cursor-pointer">
                  {dict?.footer?.freeAccountButton || "Criar Conta Gratuita"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href={`/${currentLang}/login`}>
                <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-all duration-300 backdrop-blur-md text-sm md:text-base cursor-pointer">
                  {dict?.footer?.loginButton || "Fazer Login"}
                </button>
              </Link>
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="lg:col-span-5 bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-xl flex flex-col gap-4">
            <span className={`${geistMono.className} text-xs text-white/40 uppercase tracking-widest`}>
              // {dict?.footer?.badge || "WebSocket Sincronizado"}
            </span>
            <h3 className={`${geist.className} text-xl text-white font-medium`}>
              {dict?.footer?.newsletterTitle || "Receba atualizações de produto & dicas de escrita"}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="email"
                placeholder={dict?.footer?.newsletterPlaceholder || "Seu melhor e-mail..."}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
              />
              <button className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium px-5 py-3 rounded-xl transition-all text-sm whitespace-nowrap cursor-pointer">
                {dict?.footer?.subscribeButton || "Assinar"}
              </button>
            </div>
          </div>
        </div>

        {/* Links Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-t border-white/10">
          
          {/* Col 1 */}
          <div className="flex flex-col gap-4">
            <h4 className={`${geistMono.className} text-xs text-white/40 uppercase tracking-widest font-semibold`}>
              Produto
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-white/60 font-light">
              <li><Link href="#editor" className="hover:text-white transition-colors">Editor Word-Class</Link></li>
              <li><Link href="#ai" className="hover:text-white transition-colors">HermioneGPT IA</Link></li>
              <li><Link href="#crdt" className="hover:text-white transition-colors">Edição Colaborativa</Link></li>
              <li><Link href="#export" className="hover:text-white transition-colors">Exportador DOCX & PDF</Link></li>
              <li><Link href="#mobile" className="hover:text-white transition-colors">App Mobile (Expo SDK 54)</Link></li>
            </ul>
          </div>

          {/* Col 2 */}
          <div className="flex flex-col gap-4">
            <h4 className={`${geistMono.className} text-xs text-white/40 uppercase tracking-widest font-semibold`}>
              Recursos
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-white/60 font-light">
              <li><Link href="#docs" className="hover:text-white transition-colors">Documentação Técnica</Link></li>
              <li><Link href="#ws" className="hover:text-white transition-colors">API WebSocket Multiplex</Link></li>
              <li><Link href="#changelog" className="hover:text-white transition-colors">Changelog v1.0</Link></li>
              <li><Link href="#prompts" className="hover:text-white transition-colors">Biblioteca de Prompts</Link></li>
              <li><Link href="#support" className="hover:text-white transition-colors">Suporte 24/7</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col gap-4">
            <h4 className={`${geistMono.className} text-xs text-white/40 uppercase tracking-widest font-semibold`}>
              Empresa
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-white/60 font-light">
              <li><Link href="#about" className="hover:text-white transition-colors">Sobre o Hermione</Link></li>
              <li><Link href="#manifesto" className="hover:text-white transition-colors">Manifesto dos Autores</Link></li>
              <li><Link href="#careers" className="hover:text-white transition-colors">Carreiras</Link></li>
              <li><Link href="#press" className="hover:text-white transition-colors">Imprensa</Link></li>
              <li><Link href="#contact" className="hover:text-white transition-colors">Contato</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="flex flex-col gap-4">
            <h4 className={`${geistMono.className} text-xs text-white/40 uppercase tracking-widest font-semibold`}>
              Legal & Segurança
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-white/60 font-light">
              <li><Link href="#terms" className="hover:text-white transition-colors">Termos de Serviço</Link></li>
              <li><Link href="#privacy" className="hover:text-white transition-colors">Política de Privacidade</Link></li>
              <li><Link href="#security" className="hover:text-white transition-colors">Cofre de Dados (PIN/Biometria)</Link></li>
              <li><Link href="#lgpd" className="hover:text-white transition-colors">Conformidade LGPD / GDPR</Link></li>
              <li><Link href="#cookies" className="hover:text-white transition-colors">Preferências de Cookies</Link></li>
            </ul>
          </div>
        </div>

        {/* Big Brand Typography Watermark */}
        <div className="relative w-full flex items-center justify-center my-4 overflow-hidden select-none opacity-25">
          <h1 className={`${cormorant.className} text-[14vw] font-extralight tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-white/40 to-transparent leading-none text-center`}>
            HERMIONE
          </h1>
        </div>

        {/* Bottom Bar: Copyright & Exclusive GitHub & LinkedIn Links */}
        <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-white/10 text-xs text-white/40 font-light">
          <div>
            © {new Date().getFullYear()} Hermione Inc. Todos os direitos reservados.
          </div>

          {/* Only GitHub and LinkedIn social icons */}
          <div className="flex items-center gap-5">
            <Link
              href="https://github.com/Paulos19"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-white/5 hover:bg-white/15 border border-white/10 rounded-full text-white/70 hover:text-white transition-all hover:scale-110"
              title="GitHub - Paulos19"
            >
              <GithubIcon className="w-4 h-4" />
            </Link>
            <Link
              href="https://www.linkedin.com/in/paulo-henrique20/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-white/5 hover:bg-white/15 border border-white/10 rounded-full text-white/70 hover:text-white transition-all hover:scale-110"
              title="LinkedIn - Paulo Henrique"
            >
              <LinkedinIcon className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="hover:text-white cursor-pointer transition-colors font-medium">PT</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors">EN</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors">ES</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
