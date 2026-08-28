import React, { useState, useEffect } from 'react';
import { X, Layers, Loader2, FileText, Hash, Check } from 'lucide-react';
import { api } from '../services/api';

export default function ChunkViewerModal({ isOpen, onClose, docId }) {
  const [chunks, setChunks] = useState([]);
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChunks() {
      if (docId) {
        setLoading(true);
        try {
          const res = await api.getDocumentChunks(docId);
          if (res.success) {
            setChunks(res.chunks || []);
            setDocument(res.document);
          }
        } catch (err) {
          console.error('Failed to load chunks:', err);
        } finally {
          setLoading(false);
        }
      }
    }
    if (isOpen) {
      loadChunks();
    }
  }, [isOpen, docId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl h-[85vh] glass-panel bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-4 animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
            <Layers className="w-5 h-5" />
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white">RAG Semantic Chunk Inspector</h2>
              {document && (
                <p className="text-xs text-slate-500 dark:text-slate-400">Document: {document.title} ({chunks.length} chunks indexed)</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chunks List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-sky-500 dark:text-sky-400" />
              <p className="text-xs">Loading semantic chunks from vector store...</p>
            </div>
          ) : chunks.length === 0 ? (
            <div className="text-center py-20 text-slate-400 dark:text-slate-500 text-xs">
              No vector chunks found for this document.
            </div>
          ) : (
            chunks.map((chunk, idx) => (
              <div key={chunk.id || idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200 dark:border-slate-800/80">
                  <div className="flex items-center gap-2 font-bold text-sky-600 dark:text-sky-400">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center text-[10px]">
                      #{chunk.chunkIndex + 1}
                    </span>
                    <span>Chunk {chunk.chunkIndex + 1}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Page: {chunk.pageNumber || 1}</span>
                    <span>~{chunk.tokenCount || 200} tokens</span>
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                      <Check className="w-3 h-3" /> Dense Vector Attached
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {chunk.content}
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
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
}
