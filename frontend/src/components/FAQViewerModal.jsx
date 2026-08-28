import React, { useState, useEffect } from 'react';
import { X, HelpCircle, Loader2, Sparkles, Send } from 'lucide-react';
import { api } from '../services/api';
import { useChat } from '../context/ChatContext';

export default function FAQViewerModal({ isOpen, onClose, docId, docTitle, onSelectQuestion }) {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { sendMessage } = useChat();

  useEffect(() => {
    async function loadFAQs() {
      if (docId) {
        setLoading(true);
        try {
          const res = await api.generateDocumentFAQs(docId);
          if (res.success) {
            setFaqs(res.faqs || []);
          }
        } catch (err) {
          console.error('Failed to generate FAQs:', err);
        } finally {
          setLoading(false);
        }
      }
    }
    if (isOpen) {
      loadFAQs();
    }
  }, [isOpen, docId]);

  if (!isOpen) return null;

  const handleAsk = (question) => {
    onClose();
    if (onSelectQuestion) {
      onSelectQuestion(question);
    } else {
      sendMessage(question);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl h-[80vh] glass-panel bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-4 animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <Sparkles className="w-5 h-5" />
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white">AI-Generated Institutional FAQs</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Extracted from: {docTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FAQs List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500 dark:text-purple-400" />
              <p className="text-xs">Analyzing document and extracting top student FAQs...</p>
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-20 text-slate-400 dark:text-slate-500 text-xs">
              No FAQs could be extracted for this document.
            </div>
          ) : (
            faqs.map((faq, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 text-xs font-bold text-sky-700 dark:text-sky-300">
                    <HelpCircle className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0 mt-0.5" />
                    <span>{faq.question}</span>
                  </div>
                  <button
                    onClick={() => handleAsk(faq.question)}
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-700 dark:text-sky-300 text-[11px] font-semibold transition border border-sky-500/30"
                  >
                    <Send className="w-3 h-3" /> Ask Chatbot
                  </button>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 pl-6 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition border border-slate-200 dark:border-slate-700"
          >
            Close FAQs
          </button>
        </div>

      </div>
    </div>
  );
}
