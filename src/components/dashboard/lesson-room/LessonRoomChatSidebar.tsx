'use client';

import React, { RefObject } from 'react';
import { ChatMessage } from './types';

interface LessonRoomChatSidebarProps {
  isChatOpen: boolean;
  onToggleChat: () => void;
  chatMessages: ChatMessage[];
  inputMessage: string;
  onInputChange: (val: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  chatBottomRef: RefObject<HTMLDivElement>;
}

export default function LessonRoomChatSidebar({
  isChatOpen,
  onToggleChat,
  chatMessages,
  inputMessage,
  onInputChange,
  onSendMessage,
  chatBottomRef,
}: LessonRoomChatSidebarProps) {
  return (
    <aside
      className={`fixed right-0 top-16 bottom-0 w-80 sm:w-96 backdrop-blur-2xl bg-zinc-950/90 border-l border-white/10 z-50 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl ${
        isChatOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Chat Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="font-semibold text-sm text-white">Текстовий чат уроку</h3>
        </div>
        <button
          onClick={onToggleChat}
          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Chat Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-zinc-700">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 mb-1 text-[10px] text-zinc-400">
              <span className="font-medium text-zinc-300">{msg.sender}</span>
              <span>•</span>
              <span>{msg.time}</span>
            </div>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                msg.isSelf
                  ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                  : 'bg-zinc-800/90 text-zinc-200 border border-white/10 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatBottomRef} />
      </div>

      {/* Chat Input Form */}
      <form onSubmit={onSendMessage} className="p-3 border-t border-white/10 bg-zinc-900/60 flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Напишіть повідомлення..."
          className="flex-1 bg-zinc-800/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/80 transition-colors"
        />
        <button
          type="submit"
          className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/30"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </aside>
  );
}
