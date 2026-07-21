"use client";

import { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { motion, useTransform, MotionValue, useMotionValue, AnimatePresence } from "framer-motion";
import { Bold, Italic, Strikethrough, Heading1, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useChatWebSocket } from "../hooks/useChatWebSocket";

export default function InteractiveTablet({ scrollYProgress, dict }: { scrollYProgress?: MotionValue<number>, dict?: any }) {
  const fallbackProgress = useMotionValue(0);
  const progress = scrollYProgress || fallbackProgress;

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
    view === 'chat' ? 'public-demo-token' : null, // Dummy token for public access
    (msg) => {
      // Remove typing indicator and append real message
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
    // Auto-scroll chat to bottom
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
      // Last interaction triggers the CTA directly
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', content: dict?.chat?.signupCall || "Sign up to continue!" }]);
      }, 500);
    } else {
      // Add typing indicator
      setMessages(prev => [...prev, { role: 'ai', content: '...' }]);
      
      // Send real message to n8n via WebSocket
      // Passing a dummy username to n8n as context in the content if needed, 
      // but standard sendChatMessage takes content.
      const sent = sendChatMessage(inputValue);
      
      // Fallback if websocket is disconnected
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
        class: "prose prose-invert prose-sm focus:outline-none w-full max-w-none min-h-[500px]",
      },
    },
  });

  // Tablet Animation:
  // Starts completely off-screen at the bottom (100vh) and rises to center (0vh)
  const translateY = useTransform(progress, [0, 0.7], ["100vh", "0vh"]);
  const rotateX = useTransform(progress, [0, 0.7], [25, 5]); // Tilts towards user slightly
  const rotateY = useTransform(progress, [0, 0.7], [10, -5]); // Slight pan to the left
  const rotateZ = useTransform(progress, [0, 0.7], [5, 0]);

  return (
    <motion.div 
      className="relative w-[340px] h-[480px] md:w-[420px] md:h-[600px] perspective-[2000px] pointer-events-none origin-center"
      style={{
        y: translateY,
        rotateX,
        rotateY,
        rotateZ,
      }}
    >
      {/* Tablet Portrait Frame */}
      <div
        className="pointer-events-auto w-full h-full relative"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Hardware Bezels */}
        <div className="absolute inset-0 bg-[#0A0A0A] rounded-[40px] border-[6px] border-[#181818] shadow-[0_40px_80px_rgba(0,0,0,0.8)] flex flex-col p-3 overflow-visible">
          
          {/* Camera Notch */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 flex justify-center z-20">
            <div className="w-1.5 h-1.5 rounded-full bg-black border border-white/10" />
          </div>

          {/* Hardware Buttons */}
          <div className="absolute -left-[7px] top-24 w-[3px] h-10 bg-[#181818] rounded-l-md shadow-inner" style={{ transform: 'translateZ(-1px)' }} />
          <div className="absolute -left-[7px] top-36 w-[3px] h-10 bg-[#181818] rounded-l-md shadow-inner" style={{ transform: 'translateZ(-1px)' }} />
          <div className="absolute -right-[7px] top-24 w-[3px] h-12 bg-[#181818] rounded-r-md shadow-inner" style={{ transform: 'translateZ(-1px)' }} />

          {/* Inner Screen Area */}
          <div className="relative flex-1 w-full bg-[#121212] rounded-[28px] overflow-hidden border border-white/[0.03] flex flex-col mt-2">
            
            {/* Screen Top Bar / OS Header */}
            <div className="w-full h-8 flex items-center px-4 justify-between bg-[#121212] z-10 shrink-0">
              <div className="text-[9px] text-white/30 uppercase tracking-widest font-mono">
                {view === 'editor' ? 'Hermione Editor' : 'Hermione AI'}
              </div>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              </div>
            </div>

            <div className="relative flex-1 overflow-hidden">
              <AnimatePresence initial={false} mode="wait">
                {view === 'editor' ? (
                  <motion.div 
                    key="editor"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="absolute inset-0 flex flex-col"
                  >
                    {/* Tiptap Ribbon / Toolbar */}
                    <div className="w-full h-12 bg-[#151515] border-y border-white/5 flex items-center px-3 gap-1 overflow-x-auto z-10 custom-scrollbar shrink-0 shadow-sm">
                      <button 
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                        className={`p-1.5 rounded-md transition-colors ${editor?.isActive('bold') ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white/80'}`}
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                        className={`p-1.5 rounded-md transition-colors ${editor?.isActive('italic') ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white/80'}`}
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => editor?.chain().focus().toggleStrike().run()}
                        className={`p-1.5 rounded-md transition-colors ${editor?.isActive('strike') ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white/80'}`}
                      >
                        <Strikethrough className="w-4 h-4" />
                      </button>
                      <div className="w-px h-4 bg-white/10 mx-1 shrink-0" />
                      <button 
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={`p-1.5 rounded-md transition-colors ${editor?.isActive('heading', { level: 1 }) ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white/80'}`}
                      >
                        <Heading1 className="w-4 h-4" />
                      </button>
                      <div className="flex-1" />
                      <button 
                        onClick={() => setView('chat')}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#B899FF]/10 text-[#B899FF] text-[10px] uppercase tracking-wider font-medium hover:bg-[#B899FF]/20 transition-colors shrink-0"
                      >
                        <Sparkles className="w-3 h-3" /> Ask AI
                      </button>
                    </div>

                    {/* Tiptap Editor Content */}
                    <div className="p-5 md:px-8 md:py-6 flex-1 overflow-y-auto custom-scrollbar relative z-0">
                      <EditorContent editor={editor} />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="chat"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute inset-0 flex flex-col bg-[#0A0A0A]"
                  >
                    {/* Chat Header */}
                    <div className="w-full h-12 bg-[#151515] border-y border-white/5 flex items-center px-4 justify-between z-10 shrink-0 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#B899FF]" />
                        <span className="text-[12px] font-medium text-white/90">AI Assistant</span>
                        <span className="text-[10px] text-white/40 ml-2 bg-white/5 px-2 py-0.5 rounded-full">{4 - interactions} left</span>
                      </div>
                      <button onClick={() => setView('editor')} className="p-1 text-white/40 hover:text-white/90 hover:bg-white/5 rounded-md transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Chat Messages */}
                    <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
                      {messages.map((m, i) => (
                        <div key={i} className={`max-w-[85%] p-3 text-[13px] leading-relaxed shadow-sm ${
                          m.role === 'user' 
                            ? 'bg-[#181818] text-white/90 self-end rounded-2xl rounded-tr-sm border border-white/5' 
                            : 'bg-transparent text-[#8A94A0] self-start'
                        }`}>
                          {m.role === 'ai' && <div className="text-[#B899FF] text-[10px] font-semibold mb-1 uppercase tracking-wider">Hermione</div>}
                          {m.content}
                          
                          {/* Signup CTA injected on 4th interaction */}
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

                    {/* Chat Input */}
                    <div className="p-3 border-t border-white/5 bg-[#121212] shrink-0">
                      <form onSubmit={handleSendMessage} className="relative">
                        <input
                          type="text"
                          disabled={interactions >= 4}
                          value={inputValue}
                          onChange={e => setInputValue(e.target.value)}
                          placeholder={interactions >= 4 ? "Limit reached." : (dict?.chat?.inputPlaceholder || "Type a message...")}
                          className="w-full bg-[#181818] border border-white/10 rounded-full pl-4 pr-10 py-2.5 text-[12px] text-white focus:outline-none focus:border-[#B899FF]/50 pointer-events-auto disabled:opacity-50 transition-colors"
                        />
                        <button disabled={interactions >= 4 || !inputValue.trim()} type="submit" className="absolute right-1 top-1 bottom-1 aspect-square rounded-full bg-[#B899FF]/10 text-[#B899FF] flex items-center justify-center pointer-events-auto hover:bg-[#B899FF]/20 transition-colors disabled:opacity-50">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Gradient Mask at bottom for smooth scroll fade inside tablet */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#121212] to-transparent pointer-events-none z-20" />
          </div>

          {/* Home Bar indicator at the bottom */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[35%] h-[3px] bg-white/10 rounded-full" />
        </div>

        {/* 3D Edge Thickness (Right side) */}
        <div 
          className="absolute top-8 bottom-8 right-[-3px] w-[3px] bg-[#050505] rounded-r-lg"
          style={{ transform: 'translateZ(-4px)' }}
        />
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
          width: 2px;
          height: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
      `}</style>
    </motion.div>
  );
}
