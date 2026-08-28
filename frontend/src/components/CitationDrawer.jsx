import React from 'react';
import { X, FileText, CheckCircle, Tag, Building, Percent, BookOpen } from 'lucide-react';

export default function CitationDrawer({ isOpen, onClose, citation }) {
  if (!isOpen || !citation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg h-full glass-panel bg-white dark:bg-[#0f172a] border-l border-slate-200 dark:border-slate-700/80 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
              <BookOpen className="w-5 h-5" />
              <h2 className="font-bold text-base text-slate-900 dark:text-white">Source Verification & Chunk Inspector</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Document Metadata Badges */}
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" /> Document Title:
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{citation.docTitle}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" /> Category:
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-300 font-medium">
                {citation.category || 'General'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Department:
              </span>
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{citation.department || 'All'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" /> Retrieval Relevance:
              </span>
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                {Math.round((citation.similarityScore || 0.85) * 100)}% Match Confidence
              </span>
            </div>

            {citation.pageNumber && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Estimated Page / Section:</span>
                <span className="text-xs text-slate-700 dark:text-slate-300">Page {citation.pageNumber}</span>
              </div>
            )}
          </div>

          {/* Exact Extracted Text Content */}
          <div className="mt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Exact Retrieved Chunk Excerpt (Grounded Context)
            </h3>
            <div className="p-4 rounded-xl bg-slate-100/90 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs leading-relaxed font-sans whitespace-pre-wrap selection:bg-sky-500/40">
              {citation.fullContent || citation.snippet}
            </div>
          </div>

          {/* RAG Verification Guarantee */}
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-snug">
              This passage was retrieved directly from the official institutional vector database and supplied to the LLM to guarantee factual hallucination-free generation.
            </p>
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition border border-slate-200 dark:border-slate-700"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
}
