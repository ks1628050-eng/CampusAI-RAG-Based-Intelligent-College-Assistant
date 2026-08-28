import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, 
  FileText, 
  Trash2, 
  Layers, 
  Sparkles, 
  HelpCircle, 
  Sliders, 
  BarChart3, 
  Check, 
  AlertTriangle,
  RefreshCw,
  Plus
} from 'lucide-react';
import { api } from '../services/api';
import DocumentUploadModal from './DocumentUploadModal';
import ChunkViewerModal from './ChunkViewerModal';
import FAQViewerModal from './FAQViewerModal';
import DocCompareModal from './DocCompareModal';
import AnalyticsView from './AnalyticsView';
import { GitCompare } from 'lucide-react';

export default function AdminDashboard({ onSelectQuestionForChat }) {
  const [activeTab, setActiveTab] = useState('documents'); // 'documents' | 'analytics' | 'settings'
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  
  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [selectedDocForChunks, setSelectedDocForChunks] = useState(null);
  const [selectedDocForFAQs, setSelectedDocForFAQs] = useState(null);
  const [summaryDoc, setSummaryDoc] = useState(null);
  const [summaryText, setSummaryText] = useState('');
  const [summarizing, setSummarizing] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    topK: 4,
    similarityThreshold: 0.45,
    systemPrompt: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const loadDocuments = async () => {
    setLoadingDocs(true);
    try {
      const res = await api.getDocuments();
      if (res.success) {
        setDocuments(res.documents || []);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await api.getSettings();
      if (res.success && res.settings) {
        setSettings(res.settings);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  useEffect(() => {
    loadDocuments();
    loadSettings();
  }, []);

  const handleDelete = async (docId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" and purge all its vector indices?`)) {
      return;
    }

    try {
      await api.deleteDocument(docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (err) {
      alert(`Failed to delete document: ${err.message}`);
    }
  };

  const handleSummarize = async (doc) => {
    setSummaryDoc(doc);
    setSummarizing(true);
    setSummaryText('');
    try {
      const res = await api.summarizeDocument(doc.id);
      if (res.success) {
        setSummaryText(res.summary);
      }
    } catch (err) {
      setSummaryText(`Error generating summary: ${err.message}`);
    } finally {
      setSummarizing(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await api.updateSettings(settings);
      if (res.success) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 2500);
      }
    } catch (err) {
      alert(`Failed to save settings: ${err.message}`);
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full transition-colors duration-200">
      
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Campus Knowledge & Admin Console</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage institutional document collections, vector embeddings, analytics, and RAG retrieval settings.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'documents'
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Knowledge Documents
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'analytics'
                ? 'bg-purple-500 text-white shadow-sm shadow-purple-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Analytics & Reports
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'settings'
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> RAG Settings
          </button>
        </div>
      </div>

      {/* TAB 1: KNOWLEDGE DOCUMENTS MANAGER */}
      {activeTab === 'documents' && (
        <div className="space-y-4 animate-fade-in">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Ingested College Knowledge Base</span>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-semibold border border-sky-500/20">
                {documents.length} Documents Active
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCompareOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-500/20 text-slate-700 dark:text-slate-200 hover:text-purple-700 dark:hover:text-purple-300 border border-slate-200 dark:border-slate-700 hover:border-purple-500/40 text-xs font-bold transition shadow-sm"
              >
                <GitCompare className="w-4 h-4 text-purple-500" /> Compare Policies (Diff)
              </button>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-sky-500/20 transition active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" /> Upload Document (PDF/Text)
              </button>
            </div>
          </div>

          {/* Document Inventory Table */}
          <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Document Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Chunks</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Uploaded</th>
                    <th className="py-3 px-4 text-right">RAG Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {loadingDocs ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                        Loading documents...
                      </td>
                    </tr>
                  ) : documents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                        No documents uploaded yet. Click 'Upload Document' to add institutional policies.
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0" />
                          <span className="truncate max-w-xs">{doc.title}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-300 font-medium">
                            {doc.category || 'General'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{doc.department || 'All'}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-700 dark:text-sky-400 font-bold">
                            {doc.chunkCount || 1} Chunks
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                            {doc.status || 'Indexed'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => setSelectedDocForChunks(doc.id)}
                            title="Inspect Vector Chunks"
                            className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-300 transition"
                          >
                            <Layers className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedDocForFAQs(doc)}
                            title="Generate AI FAQs"
                            className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 transition"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleSummarize(doc)}
                            title="Auto-Summarize"
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 transition"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id, doc.title)}
                            title="Delete Document & Chunks"
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: ANALYTICS & REPORTS */}
      {activeTab === 'analytics' && (
        <AnalyticsView />
      )}

      {/* TAB 3: RAG SYSTEM SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-6 animate-fade-in shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> RAG & Retrieval Hyperparameters
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure vector top-K depth, confidence thresholds, and system prompts.</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Top-K Retrieval Chunks ({settings.topK} chunks)</span>
                <span className="text-sky-600 dark:text-sky-400 font-bold">Number of chunks fed to context</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={settings.topK}
                onChange={(e) => setSettings({ ...settings, topK: Number(e.target.value) })}
                className="w-full accent-sky-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Similarity Confidence Threshold ({Math.round(settings.similarityThreshold * 100)}%)</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">Below this score triggers unknown query handler</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.8"
                step="0.05"
                value={settings.similarityThreshold}
                onChange={(e) => setSettings({ ...settings, similarityThreshold: Number(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">System Grounding Prompt</label>
              <textarea
                rows={4}
                value={settings.systemPrompt}
                onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                className="w-full p-3 rounded-xl glass-input text-xs focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition active:scale-[0.98]"
              >
                {savingSettings ? 'Saving...' : 'Save RAG Configuration'}
              </button>

              {settingsSaved && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold animate-fade-in">
                  <Check className="w-4 h-4" /> Parameters Updated!
                </span>
              )}
            </div>

          </form>
        </div>
      )}

      {/* Upload Document Modal */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={loadDocuments}
      />

      {/* Chunk Viewer Modal */}
      <ChunkViewerModal
        isOpen={!!selectedDocForChunks}
        onClose={() => setSelectedDocForChunks(null)}
        docId={selectedDocForChunks}
      />

      {/* FAQ Generator Modal */}
      <FAQViewerModal
        isOpen={!!selectedDocForFAQs}
        onClose={() => setSelectedDocForFAQs(null)}
        docId={selectedDocForFAQs?.id}
        docTitle={selectedDocForFAQs?.title}
        onSelectQuestion={onSelectQuestionForChat}
      />

      {/* Document Auto-Summary Modal */}
      {summaryDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl glass-panel bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4 animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-5 h-5" />
                <h2 className="font-bold text-base text-slate-900 dark:text-white">AI Executive Summary</h2>
              </div>
              <button onClick={() => setSummaryDoc(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">Document: {summaryDoc.title}</p>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
              {summarizing ? 'Generating institutional executive summary...' : summaryText}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSummaryDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Policy Diff / Comparison Modal */}
      <DocCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        documents={documents}
      />

    </div>
  );
}
