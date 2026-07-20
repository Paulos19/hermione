import React from "react";
import { Sparkles, Wifi, WifiOff } from "lucide-react";

interface ChatTopbarProps {
  title?: string;
  isConnected: boolean;
}

export default function ChatTopbar({ title, isConnected }: ChatTopbarProps) {
  return (
    <header className="h-[64px] bg-[#10151B] border-b border-white/5 flex items-center justify-between px-6 shrink-0 w-full z-10">
      <div className="flex items-center gap-4">
        <h2 className="text-[15px] font-medium text-[#F5F5F5] truncate max-w-[400px]">
          {title || "Hermione Workspace"}
        </h2>
        
        {title && (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#141A22] border border-white/5">
            {isConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-green-500" />
                <span className="text-[12px] font-medium text-green-500">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-red-500" />
                <span className="text-[12px] font-medium text-red-500">Offline</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141A22] border border-white/5 text-[#8A94A0] text-[13px] cursor-not-allowed">
          <Sparkles className="w-4 h-4 text-[#B899FF]" />
          <span>Hermione Intelligence</span>
        </div>
      </div>
    </header>
  );
}
