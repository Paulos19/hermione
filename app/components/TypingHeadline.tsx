"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TypingHeadlineProps {
  phrases: string[];
  className?: string;
}

export default function TypingHeadline({ phrases, className = "" }: TypingHeadlineProps) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const typeSpeed = isDeleting ? 25 : 60;
    const currentPhrase = phrases[currentPhraseIndex];

    const handleType = () => {
      if (!isDeleting && currentText === currentPhrase) {
        setTimeout(() => setIsDeleting(true), 2500);
      } else if (isDeleting && currentText === "") {
        setIsDeleting(false);
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      } else {
        const nextText = isDeleting
          ? currentPhrase.substring(0, currentText.length - 1)
          : currentPhrase.substring(0, currentText.length + 1);
        setCurrentText(nextText);
      }
    };

    const timer = setTimeout(handleType, typeSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentPhraseIndex, phrases]);

  return (
    <span className={`inline-block min-h-[1.1em] align-top relative ${className}`}>
      {currentText}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        className="inline-block w-[2px] h-[0.85em] bg-white/50 align-middle ml-1 -translate-y-[2px]"
      />
    </span>
  );
}
