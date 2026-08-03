"use client";

import { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { motion, AnimatePresence } from "framer-motion";
import { Bold, Italic, Strikethrough, Heading1, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useChatWebSocket } from "../hooks/useChatWebSocket";
import Tablet3DCanvas from "./Tablet3DCanvas";

export default function InteractiveTablet({ dict }: { dict?: any }) {
  // State to toggle between editor and chat
  const [view, setView] = useState<'editor' | 'chat'>('editor');
  
  // Chat state
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [interactions, setInteractions] = useState(0);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  
  // Generate a mock session for the public demo
  const [demoSessionId] = useState(() => 'demo-' + Math.random().toString(36).substring(2, 15));

  const { isConnected, sendChatMessage } = useChatWebSocket(
    view === 'chat' ? demoSessionId : null,
    view === 'chat' ? 'public-demo-token' : null,
    (msg) => {
      setMessages(prev => {
        const filtered = prev.filter(m => m.content !== '...');
        return [...filtered, { role: 'ai', content: msg.content }];
      });
    },
    (sysMsg) => console.log('System:', sysMsg),
    (err) => console.error('Chat error:', err)
  );

  useEffect(() => {
    if (dict?.chat?.initialGreeting && messages.length === 0) {
      setMessages([{ role: 'ai', content: dict.chat.initialGreeting }]);
    }
  }, [dict, messages.length]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || interactions >= 4) return;
    
    const newMsg = { role: 'user' as const, content: inputValue };
    const currentInt = interactions + 1;
    setInteractions(currentInt);
    setInputValue('');

    if (currentInt > 4) return;

    setMessages(prev => [...prev, newMsg]);

    if (currentInt === 4) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', content: dict?.chat?.signupCall || "Sign up to continue!" }]);
      }, 500);
    } else {
      setMessages(prev => [...prev, { role: 'ai', content: '...' }]);
      
      const sent = sendChatMessage(inputValue);
      
      if (!sent) {
        setTimeout(() => {
          setMessages(prev => {
            const filtered = prev.filter(m => m.content !== '...');
            return [...filtered, { role: 'ai', content: dict?.chat?.genericResponse || "Interesting..." }];
          });
        }, 1000);
      }
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write something extraordinary...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: `<h1>The blank page is yours.</h1><p>Hermione combines real-time collaboration with intelligent context. Start typing below to experience it.</p>`,
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-sm focus:outline-none w-full max-w-none min-h-[440px]",
      },
    },
  });

  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[400px] md:max-w-[440px] lg:max-w-[480px] h-[520px] sm:h-[580px] md:h-[620px] mx-auto">
      {/* 3D Container Frame */}
      <div className="relative w-full h-full shadow-[0_30px_90px_rgba(0,0,0,0.9)] rounded-[38px] overflow-hidden">
        
        {/* Three.js WebGL Procedural 3D Tablet Canvas (Interactive Drag-to-Rotate) */}
        <div className="absolute inset-0 z-0">
          <Tablet3DCanvas />
        </div>

        {/* Camera Pinhole Overlay (Matching Imagem 1 top center) */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#050508] border border-white/20 shadow-inner flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-[#0a1832] blur-[0.3px]" />
          </div>
        </div>

        {/* 100% Interactive Inner Screen Area */}
        <div className="absolute inset-3.5 top-6 bottom-3.5 bg-[#101012] rounded-[26px] overflow-hidden border border-white/[0.06] flex flex-col z-20 pointer-events-auto shadow-2xl">
          
          {/* OS Header Bar */}
          <div className="w-full h-7 bg-[#141416] flex items-center px-4 justify-between shrink-0 border-b border-white/5 select-none">
            <div className="text-[9px] text-white/40 uppercase tracking-widest font-mono font-medium">
              {view === 'editor' ? 'Hermione Editor' : 'Hermione AI Studio'}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence initial={false} mode="wait">
              {view === 'editor' ? (
                <motion.div 
                  key="editor"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex flex-col"
                >
                  {/* Tiptap Ribbon / Toolbar */}
                  <div className="w-full h-11 bg-[#161619] border-b border-white/5 flex items-center px-3 gap-1 overflow-x-auto z-10 custom-scrollbar shrink-0 shadow-sm">
                    <button 
                      type="button"
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      className={`p-1.5 rounded-md transition-colors ${editor?.isActive('bold') ? 'bg-white/15 text-white shadow-inner' : 'text-white/40 hover:bg-white/5 hover:text-white/80'}`}
                      title="Bold"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => editor?.chain().focus().toggleItalic().run()}
                      className={`p-1.5 rounded-md transition-colors ${editor?.isActive('italic') ? 'bg-white/15 text-white shadow-inner' : 'text-white/40 hover:bg-white/5 hover:text-white/80'}`}
                      title="Italic"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => editor?.chain().focus().toggleStrike().run()}
                      className={`p-1.5 rounded-md transition-colors ${editor?.isActive('strike') ? 'bg-white/15 text-white shadow-inner' : 'text-white/40 hover:bg-white/5 hover:text-white/80'}`}
                      title="Strikethrough"
                    >
                      <Strikethrough className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-white/10 mx-1 shrink-0" />
                    <button 
                      type="button"
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                      className={`p-1.5 rounded-md transition-colors ${editor?.isActive('heading', { level: 1 }) ? 'bg-white/15 text-white shadow-inner' : 'text-white/40 hover:bg-white/5 hover:text-white/80'}`}
                      title="Heading 1"
                    >
                      <Heading1 className="w-4 h-4" />
                    </button>
                    <div className="flex-1" />
                    <button 
                      type="button"
                      onClick={() => setView('chat')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#B899FF]/15 text-[#B899FF] text-[10px] uppercase tracking-wider font-semibold hover:bg-[#B899FF]/25 transition-all shrink-0 animate-pulse border border-[#B899FF]/30 shadow-[0_0_12px_rgba(184,153,255,0.25)] cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Ask AI
                    </button>
                  </div>

                  {/* Tiptap Editor Interactive Typing Canvas */}
                  <div 
                    className="p-5 md:px-7 md:py-6 flex-1 overflow-y-auto custom-scrollbar relative z-0 cursor-text"
                    onClick={() => editor?.chain().focus().run()}
                  >
                    <EditorContent editor={editor} />
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="chat"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex flex-col bg-[#0d0d0f]"
                >
                  {/* Chat Ribbon Header */}
                  <div className="w-full h-11 bg-[#161619] border-b border-white/5 flex items-center px-4 justify-between z-10 shrink-0 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#B899FF]" />
                      <span className="text-[12px] font-medium text-white/90">Hermione AI</span>
                      <span className="text-[10px] text-white/40 ml-2 bg-white/5 px-2 py-0.5 rounded-full">{4 - interactions} left</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setView('editor')} 
                      className="p-1 text-white/40 hover:text-white/90 hover:bg-white/5 rounded-md transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Chat Messages Log */}
                  <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
                    {messages.map((m, i) => (
                      <div key={i} className={`max-w-[85%] p-3 text-[13px] leading-relaxed shadow-sm ${
                        m.role === 'user' 
                          ? 'bg-[#1e1e24] text-white/90 self-end rounded-2xl rounded-tr-sm border border-white/5' 
                          : 'bg-transparent text-[#9da5b0] self-start'
                      }`}>
                        {m.role === 'ai' && <div className="text-[#B899FF] text-[10px] font-semibold mb-1 uppercase tracking-wider">Hermione</div>}
                        {m.content}
                        
                        {m.role === 'ai' && interactions >= 4 && i === messages.length - 1 && (
                          <div className="mt-4">
                            <Link href="/cadastro" className="flex items-center justify-center gap-2 w-full bg-[#B899FF] text-black py-2.5 rounded-lg font-medium text-[12px] hover:bg-white transition-colors pointer-events-auto shadow-[0_0_20px_rgba(184,153,255,0.3)]">
                              {dict?.chat?.signUpButton || 'Create Free Account'}
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Chat Input Form */}
                  <div className="p-3 border-t border-white/5 bg-[#141416] shrink-0">
                    <form onSubmit={handleSendMessage} className="relative">
                      <input
                        type="text"
                        disabled={interactions >= 4}
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder={interactions >= 4 ? "Limit reached." : (dict?.chat?.inputPlaceholder || "Type a message...")}
                        className="w-full bg-[#1c1c20] border border-white/10 rounded-full pl-4 pr-10 py-2.5 text-[12px] text-white focus:outline-none focus:border-[#B899FF]/50 pointer-events-auto disabled:opacity-50 transition-colors"
                      />
                      <button 
                        disabled={interactions >= 4 || !inputValue.trim()} 
                        type="submit" 
                        className="absolute right-1 top-1 bottom-1 aspect-square rounded-full bg-[#B899FF]/10 text-[#B899FF] flex items-center justify-center pointer-events-auto hover:bg-[#B899FF]/20 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Bottom Home Indicator Bar (Matching Imagem 1) */}
          <div className="w-full h-3 bg-[#101012] flex items-center justify-center shrink-0 border-t border-white/[0.03]">
            <div className="w-24 h-[3px] bg-white/20 rounded-full" />
          </div>
        </div>

      </div>

      <style jsx global>{`
        .is-editor-empty:before {
          content: attr(data-placeholder);
          float: left;
          color: rgba(255, 255, 255, 0.2);
          pointer-events: none;
          height: 0;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
          height: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
