"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { User as UserIcon } from "lucide-react";
import { Cormorant_Garamond } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

// --- Types ---
interface Testimonial {
  id: string;
  text: string;
  image?: string;
  name: string;
  role: string;
  rating: number;
  isNew?: boolean;
}



// Typing Effect Component para novos feedbacks
const TypingText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayedText(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayedText}</span>;
};

// --- Sub-Components ---
const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={`${props.className} overflow-hidden h-full flex flex-col`}>
      <div 
        className="animate-marquee-vertical flex flex-col gap-6 pb-6 w-full"
        style={{ '--duration': `${props.duration || 20}s` } as any}
      >
        {[...new Array(2)].map((_, index) => (
          <React.Fragment key={index}>
            <AnimatePresence>
              {props.testimonials.map((testimonial, i) => (
                <motion.div 
                  key={`${index}-${testimonial.id}-${i}`}
                  initial={testimonial.isNew ? { opacity: 0, scale: 0.8, y: -20, height: 0 } : { opacity: 1, scale: 1, height: "auto" }}
                  animate={{ opacity: 1, scale: 1, y: 0, height: "auto" }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="p-8 rounded-3xl border border-neutral-200/20 shadow-lg shadow-black/5 w-full bg-[#0B0F12] hover:bg-[#1A1D21] transition-all duration-300 cursor-default select-none group" 
                >
                  <blockquote className="m-0 p-0 flex flex-col gap-4">
                    {/* Stars */}
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, idx) => (
                        <svg key={idx} className={`w-4 h-4 ${idx < testimonial.rating ? 'text-[#B899FF] fill-[#B899FF]' : 'text-white/10 fill-white/10'}`} viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    
                    <p className="text-white/80 leading-relaxed font-light m-0 transition-colors duration-300 text-sm md:text-base">
                      {testimonial.isNew ? <TypingText text={testimonial.text} /> : testimonial.text}
                    </p>
                    
                    <footer className="flex items-center gap-3 mt-2">
                      <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden shrink-0 border border-white/5 group-hover:border-[#B899FF]/50 transition-colors">
                        {testimonial.image ? (
                          <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-white/50" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <cite className="font-medium not-italic tracking-tight leading-5 text-white transition-colors duration-300">
                          {testimonial.name}
                        </cite>
                        <span className="text-xs leading-5 tracking-tight text-white/50 mt-0.5 transition-colors duration-300">
                          {testimonial.role}
                        </span>
                      </div>
                    </footer>
                  </blockquote>
                </motion.div>
              ))}
            </AnimatePresence>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default function TestimonialSection({ initialFeedbacks }: { initialFeedbacks?: any[] }) {
  // Convert real feedbacks or use empty array
  const mappedFeedbacks: Testimonial[] = (initialFeedbacks || []).map((fb: any) => ({
    id: fb.id,
    text: fb.text,
    rating: fb.rating,
    name: fb.user?.name || "Autor",
    role: "Escritor",
    image: fb.user?.image || undefined,
  }));

  // Duplicate to ensure at least 6 items for uniform layout
  let displayFeedbacks = [...mappedFeedbacks];
  if (displayFeedbacks.length > 0 && displayFeedbacks.length < 6) {
    while (displayFeedbacks.length < 6) {
      displayFeedbacks = [...displayFeedbacks, ...mappedFeedbacks];
    }
  }

  // Round-robin distribution to keep columns balanced
  const initialCols: [Testimonial[], Testimonial[], Testimonial[]] = [[], [], []];
  displayFeedbacks.forEach((fb, i) => {
    const uniqueFb = { ...fb, id: `${fb.id}-${i}` };
    initialCols[i % 3].push(uniqueFb);
  });

  const [cols, setCols] = useState<[Testimonial[], Testimonial[], Testimonial[]]>(initialCols);

  const containerRef = useRef<HTMLElement>(null);
  
  // Transition background from white to black
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "start center"]
  });
  const bgColor = useTransform(scrollYProgress, [0, 1], ["#ffffff", "#030303"]);
  const textColor = useTransform(scrollYProgress, [0, 1], ["#000000", "#ffffff"]);

  const wsCounter = useRef(0);

  useEffect(() => {
    // WebSocket Conexão
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
    const ws = new WebSocket(`${WS_URL}/ws/feedback`);

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'live_feedback') {
          const newFeedback: Testimonial = {
            id: (payload.data.id || Date.now().toString()) + '-live',
            text: payload.data.text,
            rating: payload.data.rating,
            name: payload.data.name,
            role: payload.data.role,
            image: payload.data.image,
            isNew: true
          };

          // Adiciona e rotaciona entre as colunas para manter o balanceamento visual
          setCols(prev => {
            const newCols = [...prev] as [Testimonial[], Testimonial[], Testimonial[]];
            const colIndex = wsCounter.current % 3;
            newCols[colIndex] = [newFeedback, ...newCols[colIndex]];
            wsCounter.current += 1;
            return newCols;
          });
        }
      } catch (e) {
        console.error("Erro no parse do feedback ws:", e);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <motion.section 
      ref={containerRef} 
      style={{ backgroundColor: bgColor }} 
      className="py-24 relative overflow-hidden flex flex-col"
    >
      
      {/* Styles for marquee */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee-vertical {
          from { transform: translateY(0); }
          to { transform: translateY(-50%); }
        }
        .animate-marquee-vertical {
          animation: marquee-vertical var(--duration) linear infinite;
        }
        .pause-marquee:hover .animate-marquee-vertical {
          animation-play-state: paused !important;
        }
      `}} />

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.8 }}
        className="container px-4 z-10 mx-auto max-w-7xl"
      >
        <div className="flex flex-col items-center justify-center max-w-[600px] mx-auto mb-16 text-center">
          <motion.div 
            style={{ borderColor: useTransform(scrollYProgress, [0, 1], ["rgba(0,0,0,0.1)", "rgba(255,255,255,0.1)"]), backgroundColor: useTransform(scrollYProgress, [0, 1], ["rgba(0,0,0,0.05)", "rgba(255,255,255,0.05)"]) }}
            className="border py-1.5 px-5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6"
          >
            <motion.span style={{ color: useTransform(scrollYProgress, [0, 1], ["rgba(0,0,0,0.7)", "rgba(255,255,255,0.7)"]) }}>Ao Vivo</motion.span>
          </motion.div>
          <motion.h2 
            style={{ color: textColor }}
            className={`${cormorant.className} text-5xl md:text-7xl font-light tracking-wide leading-tight`}
          >
            O que estão <br />
            <span className="italic opacity-70">dizendo agora</span>
          </motion.h2>
        </div>

        {/* The pause-marquee class handles pausing on hover for all columns inside */}
        <div 
          className="pause-marquee flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] h-[740px] overflow-hidden"
        >
          <TestimonialsColumn testimonials={cols[0]} duration={20} className="w-full md:w-1/3" />
          <TestimonialsColumn testimonials={cols[1]} duration={25} className="hidden md:block w-1/3" />
          <TestimonialsColumn testimonials={cols[2]} duration={22} className="hidden lg:block w-1/3" />
        </div>
      </motion.div>
    </motion.section>
  );
}
