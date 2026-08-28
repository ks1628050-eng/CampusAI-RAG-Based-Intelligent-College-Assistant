import React, { useState } from 'react';
import { X, PhoneCall, ShieldAlert, HeartPulse, Building, Mail, Copy, Check, ExternalLink } from 'lucide-react';

const HELPLINES = [
  {
    title: 'Anti-Ragging 24/7 National Helpline',
    desc: 'Toll-free student grievance and anti-ragging support cell',
    contact: '1800-180-5522',
    type: 'phone',
    icon: '🛡️',
    color: 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400'
  },
  {
    title: 'Campus Health Centre & 24/7 Ambulance',
    desc: 'Emergency medical assistance, first aid, and ambulance dispatch',
    contact: '+91-98765-43210',
    type: 'phone',
    icon: '🚑',
    color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
  },
  {
    title: 'Women\'s Safety & Internal Complaints Cell',
    desc: 'Confidential support, safety escort, and student counselor',
    contact: '+91-98765-43211',
    type: 'phone',
    icon: '👩‍⚖️',
    color: 'border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400'
  },
  {
    title: 'Chief Warden & Hostel Welfare Office',
    desc: 'Hostel emergency, medical leave passes, and security desk',
    contact: 'hostel@campus.edu',
    type: 'email',
    icon: '🏢',
    color: 'border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400'
  },
  {
    title: 'Controller of Examinations & Academic Cell',
    desc: 'Admit cards, emergency scribe requests, and marksheet queries',
    contact: 'exams@campus.edu',
    type: 'email',
    icon: '📚',
    color: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
  },
  {
    title: 'Training & Corporate Placement Cell',
    desc: 'Campus recruitment desk, internship verification, and recruiter liaison',
    contact: 'placements@campus.edu',
    type: 'email',
    icon: '💼',
    color: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400'
  }
];

export default function EmergencyModal({ isOpen, onClose }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!isOpen) return null;

  const handleCopy = (contact, idx) => {
    navigator.clipboard.writeText(contact);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl h-[85vh] glass-panel bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-4 animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/25">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">Campus Emergency & Quick Helpline Directory</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct contacts for 24/7 student safety, medical ambulance, anti-ragging, exams, and hostel welfare.
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

        {/* Directory Cards */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {HELPLINES.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl glass-card border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/70 dark:bg-slate-900/60 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{item.icon}</span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">{item.desc}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200">
                    {item.type === 'phone' ? <PhoneCall className="w-3.5 h-3.5 text-emerald-500" /> : <Mail className="w-3.5 h-3.5 text-sky-500" />}
                    <span>{item.contact}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleCopy(item.contact, idx)}
                  title="Copy Contact"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition border border-slate-200 dark:border-slate-700"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold transition border border-slate-200 dark:border-slate-700 text-xs"
          >
            Close Directory
          </button>
        </div>

      </div>
    </div>
  );
}
