"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { submitFeedbackAction } from "@/app/actions/feedback";

export default function FeedbackClient({ user }: { user: any }) {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Por favor, escreva um comentário.");
      return;
    }
    
    setIsSubmitting(true);
    setError("");

    try {
      const res = await submitFeedbackAction(text, rating);
      
      if (res.success && res.feedback) {
        setIsSuccess(true);
        
        // Disparar WebSocket event para Landing Page
        const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
        const ws = new WebSocket(`${WS_URL}/ws/feedback`);
        
        ws.onopen = () => {
          ws.send(JSON.stringify({
            type: 'submit_feedback',
            data: {
              id: res.feedback.id,
              name: res.feedback.user.name || 'Autor',
              role: 'Autor Hermione',
              image: res.feedback.user.image,
              text: res.feedback.text,
              rating: res.feedback.rating
            }
          }));
          setTimeout(() => ws.close(), 1000); // Fecha após enviar
        };
      } else {
        setError(res.error || "Erro desconhecido");
      }
    } catch (err) {
      setError("Ocorreu um erro ao enviar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
          <Star className="w-8 h-8 text-green-400 fill-green-400" />
        </div>
        <h3 className="text-2xl font-light text-white">Obrigado pelo seu feedback!</h3>
        <p className="text-white/60">
          Sua avaliação foi enviada e já pode estar visível para o mundo em nossa página principal.
        </p>
        <button 
          onClick={() => { setIsSuccess(false); setText(""); setRating(5); }}
          className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
        >
          Enviar outro
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 bg-[#0B0F12] border border-white/5 p-8 rounded-3xl">
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Avaliação em Estrelas */}
      <div className="flex flex-col gap-3">
        <label className="text-sm text-white/50 uppercase tracking-widest">Sua Avaliação</label>
        <div className="flex gap-2" onMouseLeave={() => setHoveredRating(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95"
            >
              <Star 
                className={`w-8 h-8 transition-colors ${
                  star <= (hoveredRating || rating) 
                    ? "text-[#B899FF] fill-[#B899FF]" 
                    : "text-white/20"
                }`} 
              />
            </button>
          ))}
        </div>
      </div>

      {/* Comentário */}
      <div className="flex flex-col gap-3">
        <label className="text-sm text-white/50 uppercase tracking-widest">Seu Comentário</label>
        <textarea 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="O que você está achando de escrever com a Hermione?"
          rows={5}
          className="w-full bg-[#1A1D21] border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-[#B899FF] focus:ring-1 focus:ring-[#B899FF] transition-all resize-none font-light"
        />
      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={isSubmitting || !text.trim()}
          className="bg-white text-black px-8 py-3 rounded-full font-medium tracking-wide flex items-center gap-2 hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enviar Avaliação"}
        </button>
      </div>
    </form>
  );
}
