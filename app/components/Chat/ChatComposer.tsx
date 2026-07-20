import React, { useRef, useEffect } from "react";
import { ArrowUp, Paperclip } from "lucide-react";

interface ChatComposerProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: (e?: React.FormEvent) => void;
  isSending: boolean;
}

export default function ChatComposer({
  input,
  setInput,
  onSendMessage,
  isSending,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="w-full flex justify-center pb-8 pt-4 px-6 shrink-0 bg-transparent">
      <div className="w-full max-w-[920px] bg-[#141A22] border border-white/5 rounded-[18px] flex items-end gap-2 p-3 shadow-lg transition-all focus-within:border-white/10">
        <button
          type="button"
          className="p-2 text-[#8A94A0] hover:text-[#F5F5F5] hover:bg-white/5 rounded-xl transition-colors mb-0.5"
          title="Attach file (not available yet)"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about writing, characters, or world building..."
          className="flex-1 max-h-[240px] min-h-[44px] bg-transparent border-none resize-none text-[17px] text-[#F5F5F5] placeholder-[#8A94A0] focus:outline-none focus:ring-0 leading-[1.6] py-2.5 custom-scrollbar"
          rows={1}
          disabled={isSending}
        />

        <button
          onClick={(e) => { e.preventDefault(); onSendMessage(); }}
          disabled={isSending || !input.trim()}
          className="p-2.5 bg-[#F5F5F5] hover:bg-white text-[#10151B] rounded-xl transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none mb-0.5 cursor-pointer shadow-sm active:scale-[0.98]"
          title="Send message"
        >
          <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
