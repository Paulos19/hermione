"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { User as UserIcon, Star } from "lucide-react";

// --- Types ---
interface Testimonial {
  id: string;
  text: string;
  image?: string;
  name: string;
  role: string;
  rating: number;
  isNew?: boolean;
  timestamp?: number;
}

// Typing Effect Component
const TypingText = ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayedText(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, 25);
    return () => clearInterval(interval);
  }, [text, onComplete]);

  return (
    <span>
      {displayedText}
      <span className="inline-block w-[2px] h-[1em] bg-[#E84855] ml-0.5 animate-pulse" />
    </span>
  );
};

// Testimonial Card Component
const TestimonialCard = ({
  testimonial,
  index,
  isVisible
}: {
  testimonial: Testimonial;
  index: number;
  isVisible: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 30,
        scale: isVisible ? 1 : 0.95,
      }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      <div className={`flex flex-col md:flex-row gap-6 p-6 md:p-8 border transition-all duration-700 ${
        isVisible
          ? "bg-[#080808] border-white/[0.06]"
          : "bg-transparent border-transparent"
      }`}>
        {/* Photo Section - Diagonal Crop */}
        <div className="relative w-full md:w-[180px] h-[220px] md:h-[260px] shrink-0 overflow-hidden">
          {/* Diagonal clip path */}
          <div
            className="absolute inset-0 bg-[#0A0A0A]"
            style={{
              clipPath: 'polygon(15% 0, 100% 0, 85% 100%, 0 100%)'
            }}
          >
            {testimonial.image ? (
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="w-full h-full object-cover grayscale contrast-[1.1] brightness-[0.8] group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100 transition-all duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0A0A0A] to-[#141414]">
                <UserIcon className="w-12 h-12 text-white/20" />
              </div>
            )}
          </div>

          {/* Decorative border on diagonal */}
          <div
            className="absolute inset-0 border border-white/[0.04] group-hover:border-[#E84855]/20 transition-colors duration-500"
            style={{
              clipPath: 'polygon(15% 0, 100% 0, 85% 100%, 0 100%)'
            }}
          />
        </div>

        {/* Content Section */}
        <div className="flex flex-col justify-center flex-1 min-w-0">
          {/* Name & Role */}
          <div className="mb-4">
            <h3 className="text-lg md:text-xl font-bold text-white/90 tracking-tight">
              {testimonial.name}
            </h3>
            <p className="text-xs text-[#E84855] font-medium tracking-[0.2em] uppercase mt-1">
              {testimonial.role}
            </p>
          </div>

          {/* Divider */}
          <div className="w-8 h-[1px] bg-white/10 group-hover:bg-[#E84855]/50 group-hover:w-12 transition-all duration-500 mb-4" />

          {/* Feedback Text */}
          <p className="text-sm md:text-base text-white/50 leading-relaxed font-light mb-4">
            {testimonial.isNew ? (
              <TypingText text={testimonial.text} />
            ) : (
              testimonial.text
            )}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, idx) => (
              <Star
                key={idx}
                className={`w-3.5 h-3.5 ${
                  idx < testimonial.rating
                    ? "text-[#E84855] fill-[#E84855]"
                    : "text-white/10 fill-white/10"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Grid Background Pattern
const GridPattern = () => (
  <div className="absolute inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)]" />
  </div>
);

export default function TestimonialSection({ initialFeedbacks, dict }: { initialFeedbacks?: any[]; dict?: any }) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 4 });
  const [currentRotation, setCurrentRotation] = useState(0);
  const containerRef = useRef<HTMLElement>(null);

  // Convert real feedbacks
  const mappedFeedbacks: Testimonial[] = (initialFeedbacks || []).map((fb: any) => ({
    id: fb.id,
    text: fb.text,
    rating: fb.rating,
    name: fb.user?.name || "Autor",
    role: "Escritor",
    image: fb.user?.image || undefined,
    timestamp: new Date(fb.createdAt).getTime(),
  }));

  // Use only real feedbacks
  const allFeedbacks = mappedFeedbacks;

  // Cards per view
  const cardsPerView = 4;
  const totalCards = allFeedbacks.length;
  const totalPages = Math.max(1, Math.ceil(totalCards / cardsPerView));

  // Get visible cards based on range
  const visibleCards = allFeedbacks.slice(visibleRange.start, visibleRange.end);

  // Rotation effect - auto-advance pages (10 seconds per page)
  useEffect(() => {
    if (totalCards <= cardsPerView) return; // No rotation needed if all fit

    const interval = setInterval(() => {
      setCurrentRotation(prev => {
        const next = (prev + 1) % totalPages;
        const startIdx = next * cardsPerView;
        const endIdx = Math.min(startIdx + cardsPerView, totalCards);
        setVisibleRange({ start: startIdx, end: endIdx });
        return next;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [totalCards, totalPages]);

  // WebSocket for live feedback
  const [liveFeedbacks, setLiveFeedbacks] = useState<Testimonial[]>([]);

  useEffect(() => {
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
            name: payload.data.name || "Autor Anônimo",
            role: payload.data.role || "Escritor",
            image: payload.data.image,
            isNew: true,
            timestamp: Date.now(),
          };

          setLiveFeedbacks(prev => [newFeedback, ...prev].slice(0, 8));
        }
      } catch (e) {
        console.error("Erro no parse do feedback ws:", e);
      }
    };

    return () => ws.close();
  }, []);

  // Merge live feedbacks at the beginning
  const displayFeedbacks = [...liveFeedbacks, ...allFeedbacks];

  // Paginate all feedbacks including live ones
  const totalWithLive = displayFeedbacks.length;
  const totalPagesWithLive = Math.max(1, Math.ceil(totalWithLive / cardsPerView));

  const goToPage = (page: number) => {
    const startIdx = page * cardsPerView;
    const endIdx = Math.min(startIdx + cardsPerView, totalWithLive);
    setVisibleRange({ start: startIdx, end: endIdx });
    setCurrentRotation(page);
  };

  // Get current visible cards from the full list
  const currentVisibleCards = displayFeedbacks.slice(visibleRange.start, visibleRange.end);

  return (
    <section
      ref={containerRef}
      id="testimonials"
      className="relative w-full min-h-[100vh] bg-[#030303] py-24 md:py-32 overflow-hidden"
    >
      <GridPattern />

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center mb-16 md:mb-20"
        >
          {/* Live Badge */}
          <div className="flex items-center gap-2 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E84855] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E84855]"></span>
            </span>
            <span className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase">
              {dict?.testimonials?.badge || "AO VIVO"}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-[40px] sm:text-[48px] md:text-[56px] lg:text-[64px] leading-[1.05] font-bold text-white/90 uppercase tracking-tight">
            {dict?.testimonials?.title || "DEPOIMENTOS"}
          </h2>
          <p className="text-[14px] md:text-[16px] text-white/30 mt-4 max-w-md">
            {dict?.testimonials?.subtitle || "O que nossos escritores estão dizendo agora"}
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <AnimatePresence mode="wait">
            {currentVisibleCards.map((testimonial, i) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                index={i}
                isVisible={true}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom Indicators */}
        <div className="flex items-center justify-center gap-2 mt-12">
          {Array.from({ length: totalPagesWithLive }).map((_, page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`h-1 transition-all duration-300 ${
                currentRotation % totalPagesWithLive === page
                  ? "bg-[#E84855] w-12"
                  : "bg-white/10 hover:bg-white/20 w-8"
              }`}
            />
          ))}
        </div>

        {/* Page Counter */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <span className="text-[11px] font-mono text-white/30">
            {String((currentRotation % totalPagesWithLive) + 1).padStart(2, '0')}
          </span>
          <span className="text-[11px] text-white/20">/</span>
          <span className="text-[11px] font-mono text-white/20">
            {String(totalPagesWithLive).padStart(2, '0')}
          </span>
        </div>

      </div>
    </section>
  );
}
