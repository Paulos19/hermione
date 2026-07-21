"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import InteractiveTablet from "./InteractiveTablet";
import TypingHeadline from "./TypingHeadline";

export default function HeroSection({ dict }: { dict: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress within the 250vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Text Animation: Center to Left
  const textLeft = useTransform(scrollYProgress, [0, 0.7], ["50%", "0%"]);
  const textX = useTransform(scrollYProgress, [0, 0.7], ["-50%", "0%"]);
  // Use padding to keep it off the edge when it reaches the left
  const textPaddingLeft = useTransform(scrollYProgress, [0, 0.7], ["0rem", "4rem"]); 
  
  // Text scales down slightly as it moves to the side
  const textScale = useTransform(scrollYProgress, [0, 0.7], [1, 0.9]);

  return (
    <div ref={containerRef} className="relative w-full h-[250vh]">
      {/* Sticky view that holds the screen state */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col justify-center">
        
        {/* Background gradient/glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />

        {/* Animated Text Container */}
        <motion.div 
          className="absolute z-20 w-full max-w-[900px] flex flex-col top-[25%] md:top-[30%]"
          style={{ 
            left: textLeft, 
            x: textX, 
            paddingLeft: textPaddingLeft,
            scale: textScale,
            transformOrigin: "left center"
          }}
        >
          <h1 className="text-[32px] sm:text-[42px] md:text-[56px] lg:text-[64px] leading-[1.1] tracking-tight font-medium text-white/90">
            {dict.heroPrefix} 
            <br className="hidden md:block" />
            <TypingHeadline phrases={dict.typingPhrases} />
          </h1>
          <p className="text-[14px] md:text-[18px] text-[#8A94A0] max-w-[450px] font-light leading-relaxed mt-6">
            {dict.heroSubtitle}
          </p>
        </motion.div>

        {/* 3D Interactive Tablet Area */}
        {/* Takes up the right side of the screen when scrolled */}
        <div className="absolute right-0 top-0 w-full lg:w-[50%] h-full flex items-center justify-center lg:justify-end lg:pr-16 pointer-events-none z-30 pt-24 md:pt-16">
          <InteractiveTablet scrollYProgress={scrollYProgress} dict={dict} />
        </div>
        
      </div>
    </div>
  );
}
