"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import logoImg from "@/assets/design/logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Check, 
  ArrowLeft, 
  Crown, 
  Package, 
  Zap, 
  Radio, 
  ChevronDown, 
  BookOpen, 
  Feather, 
  Flame, 
  ShieldCheck,
  UserCheck,
  FileText,
  Activity
} from "lucide-react";
import { dict } from "@/lib/dictionaries";
import { Locale } from "@/lib/i18n-config";
import { createStripeCheckoutSessionAction } from "@/app/actions/stripe";
import { toast } from "sonner";

// WS URL
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "wss://services-websckt.khdya3.easypanel.host";
const WS_METRICS_URL = `${WS_BASE_URL}/ws/metrics`;

// --- MORPHING / TYPING TEXT COMPONENT ---
function MorphingText() {
  const words = [
    "Extraordinária.",
    "Sem Bloqueios.",
    "Com Coautoria IA.",
    "Impecável."
  ];
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [blink, setBlink] = useState(true);

  // Blink cursor
  useEffect(() => {
    const timeout = setInterval(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearInterval(timeout);
  }, []);

  // Typing logic
  useEffect(() => {
    if (subIndex === words[index].length + 1 && !reverse) {
      const timeout = setTimeout(() => {
        setReverse(true);
      }, 2000);
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? 40 : 80);

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse]);

  return (
    <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 font-serif italic font-normal">
      {words[index].substring(0, subIndex)}
      <span className={`${blink ? "opacity-100" : "opacity-0"} text-white font-sans not-italic ml-0.5 transition-opacity`}>
        |
      </span>
    </span>
  );
}

// --- REAL-TIME WEBSOCKET TYPING TOAST BANNER (APARECE APENAS COM ATUALIZAÇÕES EM TEMPO REAL) ---
function LiveSubscriberToast() {
  const [liveEvent, setLiveEvent] = useState<{ id: string; text: string } | null>(null);
  const [typedText, setTypedText] = useState("");
  const queueRef = useRef<Array<{ id: string; text: string }>>([]);
  const isTypingRef = useRef(false);
  const seenEventsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);

  // Typewriter effect logic
  useEffect(() => {
    if (!liveEvent) return;
    setTypedText("");
    let charIndex = 0;
    const textToType = liveEvent.text;

    const interval = setInterval(() => {
      if (charIndex < textToType.length) {
        setTypedText(textToType.substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(interval);
        // Exibe por 3.5 segundos e fecha suavemente
        setTimeout(() => {
          setLiveEvent(null);
          isTypingRef.current = false;
          // Processa próximo evento se houver na fila
          if (queueRef.current.length > 0) {
            const next = queueRef.current.shift();
            if (next) {
              setTimeout(() => {
                isTypingRef.current = true;
                setLiveEvent(next);
              }, 400);
            }
          }
        }, 3500);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [liveEvent]);

  // WebSocket / Live updates listener
  useEffect(() => {
    let ws: WebSocket | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;

    const pushEvent = (evt: { id: string; text: string }) => {
      if (!isTypingRef.current && !liveEvent) {
        isTypingRef.current = true;
        setLiveEvent(evt);
      } else {
        if (queueRef.current.length < 5 && !queueRef.current.some(q => q.id === evt.id)) {
          queueRef.current.push(evt);
        }
      }
    };

    const processMetricsData = (metrics: any) => {
      // Se for a primeira carga de dados ao abrir a página, apenas registramos os IDs como já existentes (históricos)
      if (isInitialLoadRef.current) {
        if (metrics.recentSubscribers) {
          metrics.recentSubscribers.forEach((sub: any) => {
            if (sub.id) seenEventsRef.current.add(`sub-${sub.id}`);
          });
        }
        if (metrics.recentActivity) {
          metrics.recentActivity.forEach((act: any) => {
            if (act.user) seenEventsRef.current.add(`act-${act.user}-${act.chapter}`);
          });
        }
        isInitialLoadRef.current = false;
        return;
      }

      // Verificação para novas assinaturas REAL-TIME ocorridas DEPOIS que o usuário já abriu a página
      if (metrics.recentSubscribers && metrics.recentSubscribers.length > 0) {
        const latestSub = metrics.recentSubscribers[0];
        const subKey = `sub-${latestSub.id}`;
        
        // Data de atualização em milissegundos
        const updatedAtTime = latestSub.updatedAt ? new Date(latestSub.updatedAt).getTime() : Date.now();
        const isRecent = (Date.now() - updatedAtTime) < (3 * 60 * 1000); // nos últimos 3 minutos

        if (!seenEventsRef.current.has(subKey)) {
          seenEventsRef.current.add(subKey);
          if (isRecent) {
            pushEvent({
              id: `${subKey}-${Date.now()}`,
              text: `✨ ${latestSub.name} acabou de assinar o plano ${latestSub.plan}!`
            });
          }
        }
      }
    };

    try {
      ws = new WebSocket(WS_METRICS_URL);
      ws.onopen = () => {
        console.log("[WS Subscribe Page] Conectado ao servidor de métricas ao vivo");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "metrics_update" && data.data) {
            processMetricsData(data.data);
          }
        } catch (e) {
          // Parse error
        }
      };

      ws.onerror = () => {
        fallbackInterval = setInterval(async () => {
          try {
            const res = await fetch("/api/metrics", { cache: "no-store" });
            if (res.ok) {
              const data = await res.json();
              processMetricsData(data);
            }
          } catch (e) {}
        }, 15000);
      };
    } catch (e) {
      // Fallback
    }

    return () => {
      if (ws) ws.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, []);

  return (
    <AnimatePresence>
      {liveEvent && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 left-6 z-50 max-w-md bg-[#0A0C10]/95 border border-white/20 text-white p-4 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl flex items-center gap-3.5"
        >
          <div className="relative shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-white/20 text-white">
            <Radio className="w-5 h-5 animate-pulse text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="text-[10px] uppercase tracking-wider font-bold text-gray-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                ATUALIZAÇÃO EM TEMPO REAL
              </span>
              <span className="text-[9px] text-gray-400 font-mono">Ao Vivo</span>
            </div>
            <p className="text-xs font-medium text-gray-100 leading-snug font-mono">
              {typedText}
              <span className="inline-block w-1.5 h-3 bg-white ml-0.5 animate-pulse" />
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- FAQ ACCORDION COMPONENT ---
function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Como funciona o plano gratuito?",
      a: "No plano Grátis você tem direito a criar até 3 livros com sincronização em nuvem e experimentar até 7 interações diretas com a Hermione (IA)."
    },
    {
      q: "Posso cancelar ou alterar minha assinatura quando quiser?",
      a: "Sim! Não há fidelidade. Você pode mudar de plano ou cancelar a renovação automática a qualquer momento no seu painel de conta."
    },
    {
      q: "O que é o arquivo .hrm e como funciona a exportação?",
      a: "O arquivo .hrm é o formato nativo da Hermione que preserva toda a Bíblia do seu livro, notas de mundo, arcos de personagens e o manuscrito para backup ou importação."
    },
    {
      q: "Quais as formas de pagamento aceitas?",
      a: "Aceitamos todos os cartões de crédito e débito via Stripe com processamento criptografado instantâneo."
    }
  ];

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div 
            key={i} 
            className="border border-white/10 rounded-2xl bg-[#0F1015]/80 overflow-hidden transition-all duration-200"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full py-5 px-6 flex items-center justify-between text-left text-sm md:text-base font-medium text-white hover:bg-white/5 transition-colors"
            >
              <span>{faq.q}</span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-white" : ""}`} />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5 pt-1 text-sm text-gray-400 leading-relaxed border-t border-white/5">
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// --- MAIN SUBSCRIBE CLIENT COMPONENT ---
export default function SubscribeClient({ 
  lang, 
  isPremium, 
  selectedPlan: initialPlan 
}: { 
  lang: string; 
  isPremium: boolean; 
  selectedPlan: string 
}) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState(initialPlan);
  const [realActivity, setRealActivity] = useState<any[]>([]);

  // Polling for user's own plan status update in real-time
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/mobile/user/me", {
          headers: { "Cache-Control": "no-cache" }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user?.selectedPlan && data.user.selectedPlan !== currentPlan) {
            setCurrentPlan(data.user.selectedPlan);
            toast.success(`Seu plano foi atualizado para ${data.user.selectedPlan.toUpperCase()}!`);
          }
        }
      } catch (err) {
        // Ignore fetch errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentPlan]);

  // Fetch real activity from DB for Voices/Activity section
  useEffect(() => {
    fetch("/api/metrics")
      .then((res) => res.json())
      .then((data) => {
        if (data.recentActivity) {
          setRealActivity(data.recentActivity);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubscribe = async (plan: "pro" | "premium") => {
    try {
      setIsProcessing(plan);
      const url = await createStripeCheckoutSessionAction(lang, plan);
      window.location.href = url;
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar checkout");
      setIsProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#F5F5F5] font-sans antialiased selection:bg-white selection:text-black relative overflow-x-hidden">
      
      {/* BACKGROUND POSTER / AMBIENT GLOW (MONOCHROME SYSTEM DESIGN) */}
      <div className="absolute top-0 left-0 right-0 h-[850px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-[#0A0B10] to-[#050507] pointer-events-none -z-10" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-white/5 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* LIVE WEBSOCKET TOAST (SOMENTE QUANDO HOUVER ATUALIZAÇÃO REAIS) */}
      <LiveSubscriberToast />

      {/* CUSTOM SYSTEM DESIGN HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#050507]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <Link href={`/${lang}/dashboard`} className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl bg-white border border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center p-1.5 group-hover:scale-105 transition-transform overflow-hidden">
                <Image 
                  src={logoImg} 
                  alt="Hermione Logo" 
                  width={40} 
                  height={40} 
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif tracking-widest text-lg font-bold text-white group-hover:text-gray-300 transition-colors">
                  HERMIONE<span className="text-gray-400">.AI</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-gray-400 -mt-1 font-mono">
                  Studio Editorial
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#planos" className="hover:text-white transition-colors">Planos</a>
            <a href="#recursos" className="hover:text-white transition-colors">Recursos</a>
            <a href="#vozes" className="hover:text-white transition-colors">Autores Ativos</a>
            <a href="#faq" className="hover:text-white transition-colors">Dúvidas</a>
          </nav>

          {/* Back Action */}
          <Link
            href={`/${lang}/dashboard`}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 text-gray-300" />
            Dashboard
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-20 pb-16 px-6 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/20 text-gray-200 text-xs font-semibold tracking-wider uppercase mb-8 shadow-inner">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
            Experiência de Coautoria Definitiva
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-light tracking-tight text-white leading-tight mb-8">
            Você Merece Uma História <br className="hidden sm:inline" />
            <MorphingText />
          </h1>

          <p className="text-base sm:text-xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed mb-12">
            Atrás de cada grande livro existe uma mentora impecável. Escolha o plano ideal para dar vida aos seus personagens, estruturar o enredo e publicar sem bloqueios.
          </p>
        </motion.div>
      </section>

      {/* PRICING SECTION - SYSTEM DESIGN CARDS */}
      <section id="planos" className="pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* CARD 1: GRÁTIS / ESSENTIAL */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`relative rounded-3xl bg-[#0E0F14]/90 border ${
              currentPlan === "free" ? "border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.1)]" : "border-white/10 hover:border-white/20"
            } p-8 flex flex-col justify-between backdrop-blur-xl transition-all duration-300`}
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  Essencial
                </span>
                {currentPlan === "free" && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    Ativo Agora
                  </span>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-semibold text-gray-400">R$</span>
                  <span className="text-5xl font-light font-serif text-white tracking-tight">0</span>
                  <span className="text-sm text-gray-500">/mês</span>
                </div>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Acesso inicial para estruturar seus primeiros rascunhos e conhecer o ambiente.
                </p>
              </div>

              <hr className="border-white/5 my-6" />

              <div className="space-y-4 mb-8">
                {[
                  { name: "Até 3 Projetos simultâneos", ok: true },
                  { name: "Sincronização em tempo real", ok: true },
                  { name: "Modo Foco e Editor Tiptap", ok: true },
                  { name: "Até 7 interações com Hermione IA", ok: true },
                  { name: "Exportação de arquivos (.hrm, .pdf)", ok: false },
                  { name: "Suporte Prioritário Editorial", ok: false }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${item.ok ? "bg-white/10 text-white" : "bg-white/5 text-gray-600"}`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className={`text-xs ${item.ok ? "text-gray-300" : "text-gray-600 line-through"}`}>
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {currentPlan === "free" ? (
                <button
                  disabled
                  className="w-full py-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-white/5 text-gray-400 border border-white/10 cursor-not-allowed"
                >
                  Plano Atual
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed"
                >
                  Incluído no Ecossistema
                </button>
              )}
            </div>
          </motion.div>

          {/* CARD 2: PRO / FULL ACCESS (FEATURED MONOCHROME CARD) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`relative rounded-3xl bg-gradient-to-b from-[#161822] via-[#0F1017] to-[#0E0F14] border ${
              currentPlan === "pro" ? "border-white shadow-[0_0_40px_rgba(255,255,255,0.2)]" : "border-white/20 hover:border-white/40"
            } p-8 flex flex-col justify-between backdrop-blur-xl shadow-2xl transition-all duration-300 transform lg:-translate-y-2`}
          >
            {/* POPULAR BADGE */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-1.5">
              <Zap className="w-3 h-3 fill-current text-black" />
              Mais Escolhido Pelos Autores
            </div>

            <div>
              <div className="flex items-center justify-between mb-6 pt-2">
                <span className="text-xs font-bold uppercase tracking-widest text-white bg-white/10 px-3 py-1 rounded-full border border-white/20">
                  Pro Co-Author
                </span>
                {currentPlan === "pro" && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    Ativo Agora
                  </span>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-semibold text-gray-400">R$</span>
                  <span className="text-5xl font-light font-serif text-white tracking-tight">19,99</span>
                  <span className="text-sm text-gray-500">/mês</span>
                </div>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Para escritores em constante fluxo criativo que exigem mais limites e recursos.
                </p>
              </div>

              <hr className="border-white/10 my-6" />

              <div className="space-y-4 mb-8">
                {[
                  { name: "Até 8 Projetos de Livros", ok: true },
                  { name: "Sincronização em tempo real ilimitada", ok: true },
                  { name: "Modo Foco e Estatísticas de Ritmo", ok: true },
                  { name: "Acesso à IA Hermione Ampliado", ok: true },
                  { name: "Exportação de arquivos (.hrm, .pdf, .docx)", ok: true },
                  { name: "Análise de Personagens e Bíblia RAG", ok: true }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs text-gray-200 font-medium">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {currentPlan === "pro" ? (
                <button
                  disabled
                  className="w-full py-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-white/10 text-white border border-white/20 cursor-not-allowed"
                >
                  Plano Ativo
                </button>
              ) : (
                <button
                  onClick={() => handleSubscribe("pro")}
                  disabled={isProcessing !== null}
                  className="w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest bg-white hover:bg-gray-100 text-black shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isProcessing === "pro" ? "Gerando Checkout..." : "DESBLOQUEAR ACESSO PRO"}
                </button>
              )}
            </div>
          </motion.div>

          {/* CARD 3: PREMIUM / PREMIERE */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`relative rounded-3xl bg-[#0E0F14]/90 border ${
              currentPlan === "premium" ? "border-amber-500/60 shadow-[0_0_35px_rgba(245,158,11,0.2)]" : "border-white/10 hover:border-white/20"
            } p-8 flex flex-col justify-between backdrop-blur-xl transition-all duration-300`}
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Premiere Unlimited
                </span>
                {currentPlan === "premium" && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    Ativo Agora
                  </span>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-semibold text-gray-400">R$</span>
                  <span className="text-5xl font-light font-serif text-white tracking-tight">49,99</span>
                  <span className="text-sm text-gray-500">/mês</span>
                </div>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Para autores profissionais. Sem nenhuma trava para o seu gênio criativo.
                </p>
              </div>

              <hr className="border-white/5 my-6" />

              <div className="space-y-4 mb-8">
                {[
                  { name: "Projetos de Livros Ilimitados", ok: true },
                  { name: "Sincronização em tempo real ilimitada", ok: true },
                  { name: "Interações ilimitadas com Hermione IA", ok: true },
                  { name: "Exportação em todos os formatos nativos", ok: true },
                  { name: "Prioridade máxima de resposta no servidor", ok: true },
                  { name: "Novos recursos beta exclusivos", ok: true }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-amber-400" />
                    </div>
                    <span className="text-xs text-gray-200 font-medium">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {currentPlan === "premium" ? (
                <button
                  disabled
                  className="w-full py-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-amber-950/40 text-amber-400 border border-amber-500/40 cursor-not-allowed"
                >
                  Plano Ativo
                </button>
              ) : (
                <button
                  onClick={() => handleSubscribe("premium")}
                  disabled={isProcessing !== null}
                  className="w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest bg-white hover:bg-gray-100 text-black transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isProcessing === "premium" ? "Gerando Checkout..." : "ENTRAR NO PREMIERE"}
                </button>
              )}
            </div>
          </motion.div>

        </div>
      </section>

      {/* VOICES OF HERMIONE / DEPOIMENTOS & ATIVIDADES REAIS */}
      <section id="vozes" className="py-20 border-t border-white/10 bg-[#090A0E]/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-serif text-white font-light mb-4">
              Atividade Real do Banco de Dados
            </h2>
            <p className="text-sm text-gray-400 font-light">
              Escritores ativos agora sincronizando capítulos, bíblicas de mundo e interagindo com o ecossistema.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {realActivity.length > 0 ? (
              realActivity.slice(0, 6).map((act, i) => (
                <div 
                  key={i} 
                  className="p-6 rounded-2xl bg-[#0F1016] border border-white/10 hover:border-white/30 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center font-bold text-xs font-mono">
                      {act.user?.substring(0, 2).toUpperCase() || "@A"}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white font-mono">{act.user}</h4>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Activity className="w-2.5 h-2.5 text-emerald-400" />
                        Capítulo: {act.chapter}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 font-mono bg-black/40 p-3 rounded-xl border border-white/5">
                    "{act.action}"
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-gray-400 text-sm font-mono">
                Aguardando atualizações do banco de dados em tempo real...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FEATURE SHOWCASE / PORTAL DA HISTÓRIA */}
      <section id="recursos" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 block">
              Tecnologia Literária
            </span>
            <h2 className="text-4xl sm:text-5xl font-serif text-white font-light leading-tight mb-6">
              Abra o Portal para Histórias que Marcam.
            </h2>
            <p className="text-gray-400 text-base leading-relaxed mb-8">
              Desenvolvida para atender às exigências de escrita acadêmica e ficção de alto nível. Com a Hermione, a estrutura da sua narrativa permanece coesa do primeiro parágrafo até a publicação final.
            </p>

            <div className="space-y-6">
              {[
                { title: "Bíblia RAG Integrada", desc: "A IA memoriza seus personagens, regras de magia e mundo sem inventar contradições." },
                { title: "Sincronização Multiplex", desc: "Escreva no computador e acompanhe o ritmo pelo celular sem perder uma palavra." },
                { title: "Exportação em Formato .hrm", desc: "Preserve seu acervo completo em um formato seguro e portátil." }
              ].map((feat, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center shrink-0 font-bold">
                    0{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{feat.title}</h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-3xl bg-gradient-to-br from-[#161822] to-[#0A0B10] border border-white/10 p-8 shadow-2xl overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 blur-3xl rounded-full" />
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-xs font-mono text-gray-400">HERMIONE_CORE_ENGINE v2.4</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">ONLINE</span>
              </div>
              <div className="p-4 rounded-xl bg-black/60 border border-white/5 font-mono text-xs text-gray-300 leading-relaxed">
                <span className="text-white">&gt; Analisando arco do protagonista...</span><br />
                <span className="text-gray-400">Verificando consistência com a Bíblia do Livro...</span><br />
                <span className="text-emerald-400">✓ Nenhuma contradição encontrada. Sugestão de ritmo gerada.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 px-6 border-t border-white/10 bg-[#07080C]/80">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif text-white font-light mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-sm text-gray-400">
              Tudo o que você precisa saber sobre a Hermione e os planos.
            </p>
          </div>
          <FAQAccordion />
        </div>
      </section>

      {/* FOOTER SYSTEM DESIGN */}
      <footer className="py-16 px-6 border-t border-white/10 bg-[#040406] text-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl bg-white border border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.15)] flex items-center justify-center p-1.5 overflow-hidden">
              <Image 
                src={logoImg} 
                alt="Hermione Logo" 
                width={36} 
                height={36} 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-serif tracking-widest text-xl font-bold text-white">
              HERMIONE<span className="text-gray-400">.AI</span>
            </span>
          </div>
          <div className="flex gap-8 text-xs font-medium text-gray-500">
            <a href="#planos" className="hover:text-white transition-colors">Planos</a>
            <a href="#recursos" className="hover:text-white transition-colors">Recursos</a>
            <a href="#faq" className="hover:text-white transition-colors">Dúvidas</a>
            <Link href={`/${lang}/dashboard`} className="hover:text-white transition-colors">Dashboard</Link>
          </div>
        </div>
        <p className="text-xs text-gray-600 font-mono">
          &copy; {new Date().getFullYear()} Hermione.AI Studio Editorial. Todos os direitos reservados.
        </p>

        {/* WATERMARK */}
        <div className="mt-12 select-none opacity-5 font-serif font-black text-6xl sm:text-9xl tracking-tighter text-white uppercase pointer-events-none">
          HERMIONE
        </div>
      </footer>

    </div>
  );
}
