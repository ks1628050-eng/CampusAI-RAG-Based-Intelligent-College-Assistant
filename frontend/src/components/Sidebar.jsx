import React from 'react';
import { 
  PlusCircle, 
  MessageSquare, 
  Trash2, 
  Database, 
  Sparkles, 
  BookOpen, 
  HelpCircle,
  FileText,
  ChevronRight
} from 'lucide-react';
import { useChat } from '../context/ChatContext';

const SAMPLE_QUESTIONS = [
  "What is the minimum attendance required for exams?",
  "What are the hostel in-time and curfew rules?",
  "What was the highest placement package last year?",
  "What is the tuition fee refund policy?",
  "What are the eligibility criteria for B.Tech CSE?"
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const { 
    conversations, 
    activeConversationId, 
    selectConversation, 
    createNewChat, 
    deleteConversation,
    sendMessage 
  } = useChat();

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-72 glass-panel border-r border-slate-200/90 dark:border-slate-800/80 
      flex flex-col justify-between transition-transform duration-300 ease-in-out
      md:translate-x-0 md:static
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      
      {/* Top Header & New Chat Button */}
      <div className="p-4 border-b border-slate-200/90 dark:border-slate-800/80">
        <button
          onClick={() => {
            createNewChat();
            setIsOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" /> New Conversation
        </button>
      </div>

      {/* Conversation History List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Chat History
        </div>

        {conversations.length === 0 ? (
          <div className="text-center py-6 px-3 text-slate-400 dark:text-slate-500 text-xs">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30 text-sky-500 dark:text-sky-400" />
            No previous conversations. Ask a question to begin!
          </div>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => {
                selectConversation(conv.id);
                setIsOpen(false);
              }}
              className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                activeConversationId === conv.id
                  ? 'bg-sky-500/10 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 font-semibold shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${activeConversationId === conv.id ? 'text-sky-500 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="truncate">{conv.title || 'Conversation'}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                }}
                title="Delete Chat"
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}

        {/* Suggested Quick Questions */}
        <div className="pt-4 border-t border-slate-200/90 dark:border-slate-800/60">
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-sky-500 dark:text-sky-400" /> Quick Inquiries
          </div>
          <div className="space-y-1 mt-1">
            {SAMPLE_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  sendMessage(q);
                  setIsOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition truncate block"
              >
                • {q}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Footer Knowledge Base Status */}
      <div className="p-3.5 border-t border-slate-200/90 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40">
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <p className="text-[11px] font-medium text-slate-800 dark:text-slate-300">RAG Vector Index</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Institutional Docs Loaded</p>
            </div>
          </div>
          <Database className="w-4 h-4 text-sky-500 dark:text-sky-400 opacity-80" />
        </div>
      </div>

    </aside>
  );
}
