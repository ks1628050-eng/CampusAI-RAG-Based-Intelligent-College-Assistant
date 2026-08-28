import React from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  ShieldCheck, 
  BarChart3, 
  MessageSquare, 
  LogOut, 
  User, 
  Globe, 
  Filter,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = [
  'All',
  'Admissions',
  'Fees & Scholarships',
  'Hostel & Mess',
  'Exams & Academics',
  'Placements'
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' }
];

export default function Navbar({ activeView, setActiveView, onOpenAuth, onOpenEvaluator, onOpenEmergency }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { 
    activeCategory, 
    setActiveCategory, 
    activeLanguage, 
    setActiveLanguage 
  } = useChat();
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-200/90 dark:border-slate-800/80 px-4 lg:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 shadow-lg shadow-sky-500/20 text-white">
            <GraduationCap className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-400"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">CampusAI</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sky-500 dark:text-sky-400" /> RAG Assistant
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Institutional Knowledge Base & Student Helper</p>
          </div>
        </div>

        {/* Center Category Filter (When in Chat View) */}
        {activeView === 'chat' && (
          <div className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="px-2 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Topic:
            </span>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  activeCategory === cat
                    ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          
          {/* Multilingual Selector */}
          <div className="relative group hidden sm:block">
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/60 transition">
              <Globe className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
              <span>{LANGUAGES.find(l => l.code === activeLanguage)?.label.split(' ')[0]}</span>
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block w-40 p-1 rounded-xl glass-panel shadow-2xl border border-slate-200 dark:border-slate-700 z-50 animate-fade-in">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setActiveLanguage(lang.code)}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition ${
                    activeLanguage === lang.code ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="flex items-center justify-center p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/60 transition shadow-sm active:scale-95"
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 animate-fade-in" />
            ) : (
              <Moon className="w-4 h-4 text-sky-600 animate-fade-in" />
            )}
          </button>

          {/* Evaluator Benchmark Demo Suite Launcher */}
          <button
            onClick={() => onOpenEvaluator?.()}
            title="Open Evaluator Benchmark Suite (1-Click Test Cases)"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25 hover:shadow-amber-500/40 hover:opacity-95 transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" /> Evaluator Suite
          </button>

          {/* Campus Helplines Trigger */}
          <button
            onClick={() => onOpenEmergency?.()}
            title="Campus Safety & Helplines"
            className="flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 text-xs font-semibold rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition active:scale-95"
          >
            <span className="text-xs">🚨</span>
            <span className="hidden md:inline">Helplines</span>
          </button>

          {/* View Switcher for Admin */}
          {isAdmin && (
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setActiveView('chat')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  activeView === 'chat'
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" /> Chat
              </button>
              <button
                onClick={() => setActiveView('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  activeView === 'admin'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Admin Console
              </button>
            </div>
          )}

          {/* User Account / Login Button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">{user?.name}</p>
                  <p className="text-[10px] text-sky-600 dark:text-sky-400 capitalize">{user?.role} • {user?.department || 'General'}</p>
                </div>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:opacity-95 shadow-md shadow-sky-500/20 transition"
            >
              <User className="w-3.5 h-3.5" /> Sign In / Demo
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
