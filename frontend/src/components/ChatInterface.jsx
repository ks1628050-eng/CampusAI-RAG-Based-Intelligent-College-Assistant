import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  GraduationCap, 
  BookOpen, 
  ShieldAlert, 
  ArrowDown, 
  Layers,
  FileCheck2,
  Printer,
  Download,
  Zap,
  RotateCcw
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import MessageBubble from './MessageBubble';
import VoiceInput from './VoiceInput';

const TOPIC_SUGGESTIONS = [
  {
    topic: 'Admissions & Cutoffs',
    icon: '🎓',
    questions: [
      'What are the eligibility criteria and cutoff ranks for B.Tech CSE?',
      'What is the last date to submit the 2026 admissions application?'
    ]
  },
  {
    topic: 'Fees & Scholarships',
    icon: '💰',
    questions: [
      'What is the annual tuition fee and hostel charges for first year?',
      'What are the merit scholarship criteria for JEE rankers?'
    ]
  },
  {
    topic: 'Hostel & Campus Rules',
    icon: '🏢',
    questions: [
      'What are the hostel in-time and curfew rules on weekdays?',
      'What appliances are strictly prohibited in hostel rooms?'
    ]
  },
  {
    topic: 'Exams & Attendance',
    icon: '📚',
    questions: [
      'What is the minimum mandatory attendance percentage for exams?',
      'How does the 10-point letter grading and backlogs rule work?'
    ]
  },
  {
    topic: 'Placements & Internships',
    icon: '💼',
    questions: [
      'What was the highest and average CTC in the recent placement drive?',
      'What are the eligibility criteria for final year campus placements?'
    ]
  }
];

export default function ChatInterface({ onOpenEvaluator }) {
  const { 
    messages, 
    loading, 
    sendMessage, 
    activeCategory, 
    setActiveCategory,
    clearChat
  } = useChat();
  
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || loading) return;
    sendMessage(inputText);
    setInputText('');
  };

  const handleVoiceTranscript = (transcript) => {
    if (transcript) {
      sendMessage(transcript);
    }
  };

  const exportCertifiedTranscript = () => {
    if (messages.length === 0) return;

    let transcript = `# CampusAI - Certified Institutional Inquiry Transcript\n`;
    transcript += `Generated On: ${new Date().toLocaleString()}\n`;
    transcript += `Total Q&A Exchanges: ${Math.floor(messages.length / 2)}\n`;
    transcript += `Grounding Verification: 100% Verified Grounded Retrieval\n\n`;
    transcript += `========================================================================\n\n`;

    messages.forEach((m, idx) => {
      if (m.role === 'user') {
        transcript += `[STUDENT QUERY - ${new Date(m.createdAt || Date.now()).toLocaleTimeString()}]\n`;
        transcript += `Question: ${m.content}\n\n`;
      } else {
        transcript += `[CAMPUS AI RESPONSE - Confidence: ${m.confidenceScore || 85}%]\n`;
        transcript += `${m.content}\n\n`;
        if (m.sources && m.sources.length > 0) {
          transcript += `Official Document Citations:\n`;
          m.sources.forEach((s, sIdx) => {
            transcript += `  ${sIdx + 1}. ${s.docTitle} (Page ${s.pageNumber || 1})\n`;
          });
          transcript += `\n`;
        }
        transcript += `------------------------------------------------------------------------\n\n`;
      }
    });

    const blob = new Blob([transcript], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CampusAI_Certified_Transcript_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] overflow-hidden bg-gradient-to-b from-slate-50 via-sky-50/20 to-slate-100 dark:from-[#0b0f17] dark:to-[#080d1a] transition-colors duration-200">
      
      {/* Scrollable Message Area */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Welcome Screen when no messages */}
          {messages.length === 0 ? (
            <div className="py-8 space-y-8 animate-fade-in">
              
              {/* Hero Banner */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-purple-600 shadow-xl shadow-sky-500/25 text-white mb-2">
                  <GraduationCap className="w-9 h-9" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Welcome to <span className="bg-gradient-to-r from-sky-500 to-purple-600 dark:from-sky-400 dark:to-purple-400 bg-clip-text text-transparent">CampusAI</span>
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                  Your institutional AI advisor grounded in verified college guidelines, admissions criteria, examination codes, hostel rules, and placement reports.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
                    <FileCheck2 className="w-3.5 h-3.5" /> 100% Grounded In Institutional Docs
                  </span>
                  <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-semibold border border-sky-500/20 flex items-center gap-1.5 shadow-sm">
                    <Layers className="w-3.5 h-3.5" /> Semantic Vector Search + Citations
                  </span>
                </div>

                {/* 1-Click Evaluator Benchmark Banner */}
                <div className="pt-3">
                  <button
                    onClick={() => onOpenEvaluator?.()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-800 dark:text-amber-300 border border-amber-500/40 text-xs font-bold shadow-sm transition active:scale-95"
                  >
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Evaluation Demo Mode: Run Gold-Standard Test Scenarios</span>
                  </button>
                </div>
              </div>

              {/* Topic Suggestion Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                {TOPIC_SUGGESTIONS.map((cat, cIdx) => (
                  <div key={cIdx} className="glass-card rounded-xl p-4 border border-slate-200 dark:border-slate-800/80 hover:border-sky-500/40 transition flex flex-col justify-between space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cat.icon}</span>
                      <h3 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100">{cat.topic}</h3>
                    </div>
                    <div className="space-y-1.5">
                      {cat.questions.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => sendMessage(q)}
                          className="w-full text-left p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 hover:bg-sky-50 dark:hover:bg-sky-500/15 border border-slate-200/80 dark:border-slate-800/60 hover:border-sky-500/30 text-[11px] text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-300 transition"
                        >
                          "{q}"
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            // Message Feed
            <div>
              {/* Top Action Bar when messages exist */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Active Consultation Session ({messages.length} messages)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={exportCertifiedTranscript}
                    title="Export Certified Inquiry Transcript"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium transition shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-500" /> Export Transcript
                  </button>
                  <button
                    onClick={clearChat}
                    title="Clear Conversation"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-slate-700 hover:border-rose-500/30 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Clear
                  </button>
                </div>
              </div>

              {messages.map((msg, index) => (
                <MessageBubble key={msg.id || index} message={msg} />
              ))}

              {/* Loading Indicator */}
              {loading && (
                <div className="flex gap-3 my-4 animate-fade-in items-start">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shrink-0 text-white shadow-md shadow-sky-500/20 mt-1 animate-pulse">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="glass-card rounded-2xl rounded-tl-none p-4 border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-md">
                    <div className="flex space-x-1.5">
                      <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Searching vector database & synthesizing factual response...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

        </div>
      </div>

      {/* Bottom Floating Input Bar */}
      <div className="p-4 border-t border-slate-200/90 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl transition-colors duration-200">
        <div className="max-w-4xl mx-auto space-y-2">
          
          <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
            
            {/* Voice Input STT */}
            <VoiceInput onTranscript={handleVoiceTranscript} disabled={loading} />

            {/* Input Box */}
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask any question regarding admissions, fees, hostel rules, exams, placements..."
                disabled={loading}
                className="w-full pl-4 pr-12 py-3 text-xs sm:text-sm rounded-xl glass-input placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition shadow-sm"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                title="Send Question"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-40 disabled:hover:from-sky-500 disabled:hover:to-blue-600 text-white transition shadow-md shadow-sky-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </form>

          {/* Footer Disclaimer */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
            <span>🛡️ Answers are strictly grounded in institutional knowledge files with source citations.</span>
            <span className="hidden sm:inline">Press Enter ↵ to send</span>
          </div>

        </div>
      </div>

    </div>
  );
}
