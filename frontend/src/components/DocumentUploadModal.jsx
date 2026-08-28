import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';

const CATEGORIES = [
  'General',
  'Admissions',
  'Fees & Scholarships',
  'Hostel & Mess',
  'Exams & Academics',
  'Placements',
  'Library',
  'Campus Life'
];

export default function DocumentUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [department, setDepartment] = useState('All');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' '));
      }
      setError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (!title) {
        setTitle(droppedFile.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' '));
      }
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF or text document to upload');
      return;
    }

    setUploading(true);
    setError('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title || file.name);
      formData.append('category', category);
      formData.append('department', department);

      const res = await api.uploadDocument(formData);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onUploadSuccess?.();
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload and index document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg glass-panel bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-5 animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
            <UploadCloud className="w-5 h-5" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">Upload Institutional Document</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Drag and drop dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
              file 
                ? 'border-sky-500/60 bg-sky-500/5' 
                : 'border-slate-300 dark:border-slate-700 hover:border-sky-500 bg-slate-50 dark:bg-slate-900/40'
            }`}
            onClick={() => document.getElementById('file-upload-input')?.click()}
          >
            <input
              id="file-upload-input"
              type="file"
              accept=".pdf,.txt,.md,.markdown"
              className="hidden"
              onChange={handleFileChange}
            />
            {file ? (
              <div className="flex items-center justify-center gap-2 text-sky-700 dark:text-sky-300 text-xs font-semibold">
                <FileText className="w-5 h-5 text-sky-500" />
                <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            ) : (
              <div className="space-y-2">
                <UploadCloud className="w-8 h-8 text-sky-500 dark:text-sky-400 mx-auto opacity-80" />
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Click to browse or drag & drop PDF or text file</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Supports PDF, TXT, MD up to 20MB</p>
              </div>
            )}
          </div>

          {/* Document Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Document Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. B.Tech Admissions Handbook 2026"
              required
              className="w-full px-3 py-2 text-xs rounded-xl glass-input placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          {/* Category & Department */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Admissions / Computer Science"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-sky-500/25 transition flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Chunking, Generating Embeddings & Indexing...
                </>
              ) : (
                'Index Document to Vector Store'
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
