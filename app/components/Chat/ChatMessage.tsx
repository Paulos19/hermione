import React from "react";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  id: string;
  role: string;
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-[85%] rounded-[18px] px-6 py-5 leading-[1.8] text-[17px] ${
          isUser
            ? "bg-[#1A1F27] text-[#F5F5F5] rounded-br-sm shadow-sm"
            : "bg-[#141A22] text-[#F5F5F5] border border-white/5 rounded-bl-sm shadow-sm"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="w-full text-[#F5F5F5]">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-4 last:mb-0 leading-[1.8] text-[17px]">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-[#F5F5F5]">{children}</strong>,
                ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                li: ({ children }) => <li className="text-[#F5F5F5]">{children}</li>,
                h1: ({ children }) => <h1 className="text-[22px] font-serif font-bold mt-6 mb-4 text-[#F5F5F5]">{children}</h1>,
                h2: ({ children }) => <h2 className="text-[20px] font-serif font-semibold mt-6 mb-3 text-[#F5F5F5]">{children}</h2>,
                h3: ({ children }) => <h3 className="text-[18px] font-medium mt-5 mb-3 text-[#F5F5F5]">{children}</h3>,
                code: ({ children }) => (
                  <code className="bg-[#1A1F27] px-1.5 py-0.5 rounded-md font-mono text-[14px] text-[#B899FF]">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-[#1A1F27] p-4 rounded-xl border border-white/5 my-4 overflow-x-auto text-[14px] font-mono leading-relaxed">
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-[#B899FF] pl-4 italic text-[#8A94A0] my-4">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
