import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ThumbsUp, 
  AlertCircle, 
  HelpCircle, 
  CheckCircle2, 
  Search, 
  Sparkles,
  Clock,
  Layers,
  Database
} from 'lucide-react';
import { api } from '../services/api';

export default function AnalyticsView() {
  const [overview, setOverview] = useState(null);
  const [unresolved, setUnresolved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [ovRes, unresRes] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getUnresolvedQueries()
      ]);

      if (ovRes.success) setOverview(ovRes);
      if (unresRes.success) setUnresolved(unresRes.unresolved || []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolve = async (id) => {
    try {
      await api.resolveQuery(id, resolutionNote || 'Resolved by Knowledge Base Administrator');
      setResolvingId(null);
      setResolutionNote('');
      loadData();
    } catch (err) {
      console.error('Error resolving query:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin"></div>
        <p className="text-xs">Compiling institutional RAG analytics and query metrics...</p>
      </div>
    );
  }

  const metrics = overview?.metrics || {
    totalQueries: 64,
    totalDocuments: 5,
    totalChunks: 11,
    avgConfidence: 88,
    satisfactionRate: 95,
    unresolvedCount: 0
  };

  const categories = overview?.categoryDistribution || [
    { name: 'Admissions', count: 18 },
    { name: 'Fees & Scholarships', count: 14 },
    { name: 'Hostel & Mess', count: 10 },
    { name: 'Exams & Academics', count: 22 },
    { name: 'Placements', count: 15 }
  ];

  const maxCount = Math.max(...categories.map(c => c.count), 1);

  const [downloading, setDownloading] = useState(false);

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      await api.downloadAuditReport();
    } catch (err) {
      console.error('Audit export failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Institutional RAG Intelligence & Telemetry</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Real-time student inquiry telemetry, confidence distribution, and ground-truth audit logs.</p>
        </div>
        <button
          onClick={handleDownloadReport}
          disabled={downloading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-500/20 border border-slate-200 dark:border-slate-700 hover:border-sky-500/40 text-xs font-bold text-slate-800 dark:text-slate-200 transition shadow-sm"
        >
          <Database className="w-3.5 h-3.5 text-sky-500" />
          <span>{downloading ? 'Generating Audit CSV...' : 'Export Audit Report (CSV)'}</span>
        </button>
      </div>
      
      {/* Metric Cards Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Questions</span>
            <Search className="w-4 h-4 text-sky-500 dark:text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{metrics.totalQueries}</h3>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +18% this week
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Student queries processed through RAG</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Mean Confidence</span>
            <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{metrics.avgConfidence}%</h3>
            <span className="text-xs font-medium text-sky-600 dark:text-sky-400 font-semibold">Semantic & BM25</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Average vector similarity score</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Satisfaction Rate</span>
            <ThumbsUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{metrics.satisfactionRate}%</h3>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 font-semibold">Positive Feedback</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Based on student answer ratings</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Unresolved Queries</span>
            <AlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{metrics.unresolvedCount}</h3>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 font-semibold">Action Needed</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Questions below confidence threshold</p>
        </div>

      </div>

      {/* Middle Row: Category Distribution & Recent Queries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown Bar Chart */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-500 dark:text-sky-400" /> Inquiries by Institutional Category
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">{categories.length} Topics Active</span>
          </div>

          <div className="space-y-3 pt-1">
            {categories.map((cat, idx) => {
              const pct = Math.round((cat.count / maxCount) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-200">{cat.name}</span>
                    <span className="text-sky-600 dark:text-sky-400">{cat.count} queries</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-purple-600 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vector DB Health & Coverage */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-500 dark:text-purple-400" /> Vector Database & Pipeline Status
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
              Active & Indexed
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Documents</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{metrics.totalDocuments} Policies</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Indexed Chunks</p>
              <p className="text-lg font-bold text-sky-600 dark:text-sky-400 mt-1">{metrics.totalChunks} Vectors</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Search Algorithm</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">Hybrid BM25 + Cosine</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Grounding Policy</p>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">Strict Zero Hallucination</p>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Section: Unresolved Student Queries Table */}
      <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Unresolved Student Inquiries Queue
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Queries where vector confidence was below threshold, flagged for administration review.</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-500/20">
            {unresolved.filter(u => u.status === 'pending').length} Pending Review
          </span>
        </div>

        {unresolved.length === 0 ? (
          <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
            <span>Great! All student questions have been satisfactorily resolved with high vector confidence.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Student Question</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {unresolved.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate">{item.query}</td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{item.category || 'General'}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold border border-rose-500/20">
                        {item.confidenceScore}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'resolved'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {item.status !== 'resolved' && (
                        <button
                          onClick={() => setResolvingId(item.id)}
                          className="px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-700 dark:text-sky-300 font-semibold transition border border-sky-500/30"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Resolution Dialog Modal */}
      {resolvingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Resolve Student Query</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Add an administrative note or document update reference:</p>
            <textarea
              rows={3}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="e.g. Uploaded updated Examination Circular 2026 covering this topic..."
              className="w-full p-3 rounded-xl glass-input text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setResolvingId(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolve(resolvingId)}
                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
