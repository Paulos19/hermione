"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import InteractiveTablet from "./InteractiveTablet";
import TypingHeadline from "./TypingHeadline";

export default function HeroSection({ dict }: { dict: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress within the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Text Animation: Pure GPU Accelerated translateX (Center to Left)
  const textX = useTransform(scrollYProgress, [0, 0.7], ["calc(50vw - 50% - 2rem)", "0px"]);
  const textScale = useTransform(scrollYProgress, [0, 0.7], [1, 0.92]);

  return (
    <div ref={containerRef} className="relative w-full h-[180vh] md:h-[250vh]">
      {/* Sticky view that holds the screen state */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col justify-center">
        
        {/* Background gradient/glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#B899FF]/[0.03] blur-[120px] rounded-full pointer-events-none" />

        {/* Animated Text Container */}
        <motion.div 
          className="absolute z-20 w-full max-w-[900px] flex flex-col top-[20%] md:top-[30%] left-6 md:left-16 pr-6 md:pr-0"
          style={{ 
            x: textX, 
            scale: textScale,
            transformOrigin: "left center"
          }}
        >
          <h1 className="text-[36px] sm:text-[48px] md:text-[60px] lg:text-[68px] leading-[1.1] tracking-tight font-semibold text-white/95 font-[family-name:var(--font-cormorant-garamond)]">
            {dict.heroPrefix} 
            <br className="hidden md:block" />
            <TypingHeadline phrases={dict.typingPhrases} />
          </h1>
          <p className="text-[15px] md:text-[18px] text-[#8A94A0] max-w-[450px] font-light leading-relaxed mt-6">
            {dict.heroSubtitle}
          </p>
        </motion.div>

        {/* 3D Interactive Tablet Area */}
        <div className="absolute right-0 top-0 w-full lg:w-[50%] h-full flex items-center justify-center lg:justify-end lg:pr-16 pointer-events-none z-30 pt-24 md:pt-16">
          <InteractiveTablet scrollYProgress={scrollYProgress} dict={dict} />
        </div>
        
      </div>
    </div>
  );
}
