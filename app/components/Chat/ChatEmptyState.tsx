import React from "react";
import { Sparkles } from "lucide-react";

export default function ChatEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full max-w-[600px] mx-auto animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 bg-[#141A22] border border-white/5 rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
        <Sparkles className="w-10 h-10 text-[#B899FF]" strokeWidth={1.5} />
      </div>
      
      <h2 className="text-[42px] font-serif font-medium text-[#F5F5F5] mb-4 tracking-tight">
        Converse com a Hermione
      </h2>
      
      <p className="text-[17px] text-[#8A94A0] leading-[1.6]">
        Ask questions about writing, characters, chapters, plots, dialogue or world building. Hermione is your professional writing partner.
      </p>
    </div>
  );
}
