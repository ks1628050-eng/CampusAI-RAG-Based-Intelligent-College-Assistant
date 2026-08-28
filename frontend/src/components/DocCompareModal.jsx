import React, { useState } from 'react';
import { X, GitCompare, Loader2, FileText, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function DocCompareModal({ isOpen, onClose, documents = [] }) {
  const [doc1Id, setDoc1Id] = useState(documents[0]?.id || '');
  const [doc2Id, setDoc2Id] = useState(documents[1]?.id || documents[0]?.id || '');
  const [comparisonText, setComparisonText] = useState('');
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCompare = async () => {
    if (!doc1Id || !doc2Id) {
      setError('Please select two documents to compare');
      return;
    }
    if (doc1Id === doc2Id) {
      setError('Please select two distinct documents for comparison');
      return;
    }

    setComparing(true);
    setError('');
    setComparisonText('');

    try {
      const res = await api.compareDocuments(doc1Id, doc2Id);
      if (res.success) {
        setComparisonText(res.comparison);
      }
    } catch (err) {
      setError(err.message || 'Comparison failed');
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl h-[88vh] glass-panel bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-4 animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/25">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">Institutional Policy Diff & Document Comparison</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Perform comparative semantic analysis across two college circulars, guidelines, or handbook versions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selection Area */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Document 1 (Baseline / Reference)
              </label>
              <select
                value={doc1Id}
                onChange={(e) => setDoc1Id(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({d.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Document 2 (Target / Comparative)
              </label>
              <select
                value={doc2Id}
                onChange={(e) => setDoc2Id(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({d.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500">Compares vectorized chunks & semantic policy statements</span>
            <button
              onClick={handleCompare}
              disabled={comparing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-500/25 transition disabled:opacity-50"
            >
              {comparing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing Semantic Diff...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Compare Policies
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Comparison Result Area */}
        <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-sans">
          {comparing ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
              <p className="text-xs">Computing cross-document semantic difference & policy divergence...</p>
            </div>
          ) : comparisonText ? (
            comparisonText
          ) : (
            <div className="text-center py-20 text-slate-400 text-xs">
              Select two documents and click "Compare Policies" to generate an automated institutional comparison report.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold transition border border-slate-200 dark:border-slate-700 text-xs"
          >
            Close Diff Inspector
          </button>
        </div>

      </div>
    </div>
  );
}
