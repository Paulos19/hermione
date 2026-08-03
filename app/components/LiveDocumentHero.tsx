"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════ DATA ═══════════════════════ */

const DOCUMENT_TITLE = "O Último Reino";

const PARAGRAPHS = [
  {
    id: "p1",
    text: "A chuva caía sobre a cidade esquecida, lavando as ruas de pedra com uma persistência que parecia querer apagar todas as marcas do tempo.",
  },
  {
    id: "p2",
    text: "Elena observava pela janela do sótão, os dedos traçando círculos no vidro embaçado. Ela sabia que aquele seria o último capítulo.",
  },
  {
    id: "p3",
    text: "— Você realmente acredita que alguém vai ler isso? — a voz veio de trás, carregada de uma ironia que ela conhecia bem demais.",
  },
  {
    id: "p4",
    text: "Ela não respondeu. As palavras certas viriam quando precisassem vir. Sempre vinham.",
  },
];

interface AIComment {
  id: string;
  line: number;
  text: string;
  type: "suggestion" | "rewrite" | "comment";
  author?: string;
  avatar?: string;
}

const AI_SUGGESTIONS: AIComment[] = [
  {
    id: "ai1",
    line: 0,
    text: "\"persistência\" → \"insistência silenciosa\" para maior carga emocional",
    type: "suggestion",
  },
  {
    id: "ai2",
    line: 2,
    text: "Este diálogo transmite tensão perfeita. Manter.",
    type: "comment",
    author: "Ana L.",
    avatar: "A",
  },
  {
    id: "ai3",
    line: 1,
    text: "Reescrever: \"...os dedos desenhando constelações no vidro\"",
    type: "rewrite",
  },
  {
    id: "ai4",
    line: 3,
    text: "Considere expandir para revelar a motivação interna da Elena.",
    type: "suggestion",
  },
];

const COLLABORATORS = [
  { name: "João R.", color: "#6DAAFF", avatar: "J", cursor: { line: 1, char: 42 } },
  { name: "Ana L.", color: "#FF8A6D", avatar: "A", cursor: { line: 2, char: 18 } },
];

/* ═══════════════════════ TYPING EFFECT ═══════════════════════ */
function useTypingEffect(text: string, speed: number = 35, delay: number = 0) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    setDisplayed("");
    setDone(false);

    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          setDone(true);
          clearInterval(interval);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { displayed, done };
}

/* ═══════════════════════ SUB-COMPONENTS ═══════════════════════ */

function CollaboratorCursor({ name, color }: { name: string; color: string }) {
  return (
    <span className="relative inline-block">
      <motion.span
        className="inline-block w-[2px] h-[18px] rounded-full"
        style={{ backgroundColor: color }}
        animate={{ opacity: [1, 1, 0, 0, 1] }}
        transition={{ duration: 1.1, repeat: Infinity, times: [0, 0.49, 0.5, 0.99, 1], ease: "linear" }}
      />
      <span
        className="absolute -top-5 left-0 text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap"
        style={{ backgroundColor: color, color: "#fff" }}
      >
        {name}
      </span>
    </span>
  );
}

function AISuggestionBubble({ comment, index }: { comment: AIComment; index: number }) {
  const isAI = comment.type === "suggestion" || comment.type === "rewrite";
  const borderColor = isAI ? "border-[#B899FF]/30" : "border-[#FF8A6D]/30";
  const glowColor = isAI ? "shadow-[0_0_20px_rgba(184,153,255,0.08)]" : "";
  const iconColor = isAI ? "text-[#B899FF]" : "text-[#FF8A6D]";
  const label = comment.type === "rewrite" ? "IA REESCRITA" : comment.type === "suggestion" ? "IA SUGESTÃO" : comment.author || "COLABORADOR";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 2.5 + index * 1.8, ease: "easeOut" }}
      className={`relative bg-[#13111C]/90 backdrop-blur-xl border ${borderColor} rounded-lg px-3.5 py-2.5 ${glowColor} mb-3`}
    >
      {/* Label */}
      <div className={`flex items-center gap-1.5 mb-1.5`}>
        {comment.avatar ? (
          <div className="w-4 h-4 rounded-full bg-[#FF8A6D] flex items-center justify-center text-[8px] font-bold text-white">
            {comment.avatar}
          </div>
        ) : (
          <svg className={`w-3.5 h-3.5 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" />
            <path d="M9 22h6M10 17v5M14 17v5" />
          </svg>
        )}
        <span className={`text-[8px] font-bold tracking-[0.15em] uppercase ${iconColor}`}>
          {label}
        </span>
      </div>
      {/* Text */}
      <p className="text-[11px] leading-relaxed text-[#C5BED4]">
        {comment.text}
      </p>

      {/* Connecting line to paragraph */}
      <div className="absolute left-0 top-1/2 -translate-x-full w-6 h-[1px]" style={{ background: `linear-gradient(to left, ${isAI ? "rgba(184,153,255,0.3)" : "rgba(255,138,109,0.3)"}, transparent)` }} />
    </motion.div>
  );
}

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
export default function LiveDocumentHero() {
  const [visibleSuggestions, setVisibleSuggestions] = useState<number>(0);
  const [activeHighlight, setActiveHighlight] = useState<number | null>(null);
  const [liveWords, setLiveWords] = useState<string[]>([]);

  // Gradually reveal suggestions
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    AI_SUGGESTIONS.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setVisibleSuggestions(i + 1);
      }, 3000 + i * 1800));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  // Periodically highlight a paragraph
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHighlight(prev => {
        if (prev === null) return Math.floor(Math.random() * PARAGRAPHS.length);
        return null;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket for live words
  useEffect(() => {
    let ws: WebSocket | null = null;
    let mounted = true;

    try {
      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.hostname || "localhost";
      ws = new WebSocket(`${proto}//${host}:8080/ws/metrics`);
      ws.onmessage = (ev) => {
        if (!mounted) return;
        try {
          const p = JSON.parse(ev.data);
          if (p.type === "metrics_update" && p.data?.recentActivity) {
            const acts = p.data.recentActivity.slice(0, 3);
            setLiveWords(acts.map((a: any) => `@${a.user}: ${a.action}`));
          }
        } catch {}
      };
    } catch {}

    return () => {
      mounted = false;
      if (ws) ws.close();
    };
  }, []);

  // Typing effects for each paragraph with stagger
  const t0 = useTypingEffect(PARAGRAPHS[0].text, 30, 400);
  const t1 = useTypingEffect(PARAGRAPHS[1].text, 30, 2800);
  const t2 = useTypingEffect(PARAGRAPHS[2].text, 25, 5500);
  const t3 = useTypingEffect(PARAGRAPHS[3].text, 35, 8200);
  const typedTexts = [t0, t1, t2, t3];

  return (
    <div className="relative w-full h-full min-h-[500px] lg:min-h-[600px] flex items-center justify-center">
      {/* Glow behind the document */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[80%] h-[70%] bg-[#B899FF]/[0.04] blur-[100px] rounded-full" />
      </div>

      {/* THE FLOATING DOCUMENT */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-[900px] z-10"
      >
        {/* Editor Chrome / Window Frame */}
        <div className="bg-[#0D0B14]/95 backdrop-blur-2xl border border-white/[0.06] rounded-xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.6),0_0_60px_rgba(184,153,255,0.04)]">
          
          {/* Title Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
              </div>
              <span className="text-[11px] text-[#8E8799] font-medium ml-4 tracking-wide">
                hermione — editor
              </span>
            </div>
            <div className="flex items-center gap-4">
              {/* Collaborator avatars */}
              {COLLABORATORS.map((c, i) => (
                <div
                  key={c.name}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white border border-white/10"
                  style={{ backgroundColor: c.color }}
                >
                  {c.avatar}
                </div>
              ))}
              <span className="text-[10px] text-[#5C5470] font-medium">2 online</span>
            </div>
          </div>

          {/* Document Body */}
          <div className="flex">
            {/* Main Text Area */}
            <div className="flex-1 px-10 py-8 min-h-[400px]">
              {/* Document Title */}
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-[28px] font-semibold text-[#F5F2EC] mb-1 font-[family-name:var(--font-cormorant-garamond)]"
              >
                {DOCUMENT_TITLE}
              </motion.h2>
              <div className="text-[10px] text-[#5C5470] mb-8 tracking-wider uppercase font-medium">
                Capítulo 12 · Rascunho 3
              </div>

              {/* Paragraphs */}
              <div className="space-y-6">
                {PARAGRAPHS.map((p, i) => {
                  const typed = typedTexts[i];
                  const isHighlighted = activeHighlight === i;
                  const hasCursor = COLLABORATORS.find(c => c.cursor.line === i);

                  return (
                    <motion.div
                      key={p.id}
                      className={`relative text-[15px] leading-[2.1] transition-colors duration-700 ${
                        isHighlighted 
                          ? "text-[#F5F2EC] bg-[#B899FF]/[0.04] -mx-4 px-4 py-2 rounded-md border-l-2 border-[#B899FF]/30" 
                          : "text-[#9B93A8]"
                      }`}
                      style={{ fontFamily: 'Georgia, "Cormorant Garamond", serif' }}
                    >
                      {typed.displayed}
                      {/* Typing cursor */}
                      {!typed.done && (
                        <motion.span
                          className="inline-block w-[2px] h-[18px] bg-[#F5F2EC] ml-[2px] rounded-full align-text-bottom"
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                        />
                      )}
                      {/* Collaborator cursor */}
                      {hasCursor && typed.done && (
                        <span className="ml-1 inline-block">
                          <CollaboratorCursor name={hasCursor.name} color={hasCursor.color} />
                        </span>
                      )}

                      {/* Selection highlight effect */}
                      {isHighlighted && (
                        <motion.div
                          className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1.5"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-[#B899FF]/50" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Word count & status bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 10, duration: 0.5 }}
                className="flex items-center justify-between mt-10 pt-4 border-t border-white/[0.04]"
              >
                <span className="text-[10px] text-[#5C5470] tracking-wider">
                  2.847 palavras · Salvando...
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#27C93F] animate-pulse" />
                  <span className="text-[10px] text-[#5C5470]">Sincronizado</span>
                </div>
              </motion.div>
            </div>

            {/* RIGHT SIDEBAR: AI Suggestions & Comments */}
            <div className="w-[280px] border-l border-white/[0.04] px-5 py-8 flex flex-col gap-0 bg-[#0A0810]/50">
              <div className="text-[9px] font-bold tracking-[0.2em] text-[#5C5470] uppercase mb-4">
                Sugestões & Comentários
              </div>
              <AnimatePresence>
                {AI_SUGGESTIONS.slice(0, visibleSuggestions).map((s, i) => (
                  <AISuggestionBubble key={s.id} comment={s} index={i} />
                ))}
              </AnimatePresence>

              {/* Live WebSocket activity */}
              {liveWords.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-auto pt-4 border-t border-white/[0.04]"
                >
                  <div className="text-[9px] font-bold tracking-[0.2em] text-[#27C93F]/70 uppercase mb-3">
                    Ao vivo
                  </div>
                  {liveWords.map((w, i) => (
                    <div key={i} className="text-[10px] text-[#5C5470] mb-1.5 truncate">
                      {w}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Floating reflection/glow underneath */}
        <div className="absolute -bottom-4 left-[10%] right-[10%] h-8 bg-[#B899FF]/[0.03] blur-xl rounded-full" />
      </motion.div>
    </div>
  );
}
