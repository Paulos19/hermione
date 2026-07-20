import React, { useTransition } from "react";
import Link from "next/link";
import { Plus, MessageSquare, Trash2, Settings, LogOut, PanelLeftClose } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

interface Session {
  id: string;
  title: string;
  createdAt: Date;
}

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface ChatSidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  currentUser: User;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  isPending: boolean;
  isLoadingMessages: boolean;
}

export default function ChatSidebar({
  sessions,
  activeSessionId,
  currentUser,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  isPending,
  isLoadingMessages
}: ChatSidebarProps) {
  return (
    <aside className="w-[320px] shrink-0 bg-[#0E1318] border-r border-white/5 flex flex-col h-full">
      {/* Brand Header */}
      <div className="h-[64px] flex items-center px-6 border-b border-white/5 shrink-0">
        <h1 className="font-serif text-[22px] text-[#F5F5F5] font-semibold tracking-wide">
          Hermione
        </h1>
      </div>

      {/* New Conversation Action */}
      <div className="p-4 shrink-0">
        <button
          onClick={onNewSession}
          disabled={isPending}
          className="w-full flex items-center gap-3 px-4 py-3 bg-[#141A22] border border-white/5 rounded-xl text-[#F5F5F5] text-[14px] font-medium hover:bg-white/5 hover:border-white/10 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none group"
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-[#1A1F27] border border-white/5 group-hover:border-[#B899FF]/30 transition-colors">
            <Plus className="w-4 h-4 text-[#B899FF]" />
          </div>
          New Conversation
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar pb-4">
        {sessions.length === 0 ? (
          <div className="text-center py-10 px-4 text-[#8A94A0] text-[14px]">
            No conversations yet. <br /> Start a new one to begin.
          </div>
        ) : (
          sessions.map((s) => {
            const isActive = s.id === activeSessionId;
            return (
              <div
                key={s.id}
                onClick={() => !isLoadingMessages && onSelectSession(s.id)}
                className={`group relative flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-150 ${
                  isActive
                    ? "bg-[#141A22] text-[#F5F5F5] border border-white/5 shadow-sm"
                    : "hover:bg-white/5 text-[#8A94A0] hover:text-[#F5F5F5] border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden pr-8">
                  <MessageSquare className={`w-[14px] h-[14px] shrink-0 ${isActive ? "text-[#B899FF]" : "opacity-60"}`} />
                  <span className="text-[14px] truncate">{s.title}</span>
                </div>

                <button
                  onClick={(e) => onDeleteSession(s.id, e)}
                  className="absolute right-3 opacity-0 group-hover:opacity-100 hover:text-red-400 p-1.5 rounded-md hover:bg-white/5 transition-all duration-150"
                  title="Delete conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer / Profile */}
      <div className="p-4 border-t border-white/5 bg-[#0A0D12] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-[#1A1F27] border border-white/5 flex items-center justify-center shrink-0">
            <span className="text-[#F5F5F5] text-xs font-medium">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
            </span>
          </div>
          <div className="overflow-hidden">
            <p className="text-[14px] font-medium text-[#F5F5F5] truncate">
              {currentUser.name || "User"}
            </p>
            <p className="text-[12px] text-[#8A94A0] truncate">{currentUser.email}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 shrink-0">
          <Link
            href="/configuracoes"
            className="p-2 text-[#8A94A0] hover:text-[#F5F5F5] hover:bg-white/5 rounded-md transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="p-2 text-[#8A94A0] hover:text-red-400 hover:bg-white/5 rounded-md transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
