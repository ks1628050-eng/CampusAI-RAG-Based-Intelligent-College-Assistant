import React from 'react';
import { X, Sparkles, Zap, Award, CheckCircle, ArrowRight, ShieldCheck, Flame, BookOpen, GraduationCap } from 'lucide-react';

const BENCHMARK_SCENARIOS = [
  {
    id: 'admissions',
    title: 'Admissions Cutoff & Criteria',
    category: 'Admissions',
    icon: '🎓',
    badge: 'Core RAG Retrieval',
    query: 'What are the eligibility criteria and cutoff ranks for B.Tech Computer Science Engineering?',
    expectedCoverage: 'Admissions Guide 2026 (Page 1-2)',
    description: 'Tests hybrid vector lookup on rank cutoffs, 12th PCM 60% requirement, and counseling schedules.'
  },
  {
    id: 'fees',
    title: 'Fee Installments & Refund Slabs',
    category: 'Fees & Scholarships',
    icon: '💰',
    badge: 'Exact Numerical Policy',
    query: 'What is the tuition fee refund policy and merit scholarship criteria for JEE rankers?',
    expectedCoverage: 'Fee Structure & Scholarships 2026',
    description: 'Tests numerical table extraction, 100%/80%/50% refund timelines, and JEE top 5000 fee waivers.'
  },
  {
    id: 'hostel',
    title: 'Hostel Curfew & Prohibited Items',
    category: 'Hostel & Mess',
    icon: '🏢',
    badge: 'Campus Regulations',
    query: 'What are the hostel in-time rules on weekdays and which electrical appliances are prohibited?',
    expectedCoverage: 'Hostel Rules & Campus Facilities',
    description: 'Tests 9:30 PM curfew rules, biometric attendance, and penalty codes for room appliances.'
  },
  {
    id: 'academics',
    title: '75% Attendance & Backlog Rules',
    category: 'Exams & Academics',
    icon: '📚',
    badge: 'Strict Examination Code',
    query: 'What is the minimum mandatory attendance percentage for semester exams and how does grading work?',
    expectedCoverage: 'Academic Regulations & Examination Guidelines',
    description: 'Tests 75% attendance rule, condonation slabs for medical leave, and 10-point GPA scale.'
  },
  {
    id: 'placements',
    title: 'Placement Packages & Top Recruiters',
    category: 'Placements',
    icon: '💼',
    badge: 'Career Statistics',
    query: 'What was the highest and average CTC in the recent campus placement drive and who were the top recruiters?',
    expectedCoverage: 'Placement & Internship Report 2025-2026',
    description: 'Tests highest package (₹48 LPA), average CTC (₹12.4 LPA), and eligibility criteria.'
  },
  {
    id: 'unknown_detector',
    title: 'Out-of-Domain Safety & Unknown Query Detector',
    category: 'General',
    icon: '🛡️',
    badge: 'Zero-Hallucination Guardrail',
    query: 'What is the quantum teleportation research budget of the Mars exploration rover lab?',
    expectedCoverage: 'Unknown Question Detector (Confidence Threshold < 45%)',
    description: 'Tests fallback calibrated handler: refuses to hallucinate and logs query to Admin Review Queue.'
  }
];

export default function EvaluatorModal({ isOpen, onClose, onSelectBenchmark }) {
  if (!isOpen) return null;

  const handleRunTest = (scenario) => {
    onClose();
    onSelectBenchmark(scenario.query, scenario.category);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl h-[88vh] glass-panel bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-4 animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base text-slate-900 dark:text-white">Evaluator Demo & Benchmark Suite</h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  1-Click Evaluation
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Curated gold-standard test queries to evaluate grounding, latency, citations, and hallucination guardrails in seconds.
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

        {/* Benchmark List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {BENCHMARK_SCENARIOS.map((sc) => (
              <div
                key={sc.id}
                onClick={() => handleRunTest(sc)}
                className="group p-4 rounded-xl glass-card border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:shadow-lg transition cursor-pointer flex flex-col justify-between space-y-2.5 bg-slate-50/70 dark:bg-slate-900/60"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-lg">{sc.icon}</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                      {sc.badge}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                    {sc.title}
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                    "{sc.query}"
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="truncate max-w-[190px]">🎯 {sc.expectedCoverage}</span>
                  <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition">
                    Run Test <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Includes 5 Domain Queries + 1 Hallucination Rejection Guardrail Test</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold transition border border-slate-200 dark:border-slate-700"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
