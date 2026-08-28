import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import AdminDashboard from './components/AdminDashboard';
import CitationDrawer from './components/CitationDrawer';
import AuthModal from './components/AuthModal';
import EvaluatorModal from './components/EvaluatorModal';
import EmergencyModal from './components/EmergencyModal';
import { useChat } from './context/ChatContext';
import { useAuth } from './context/AuthContext';
import { Menu } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState('chat'); // 'chat' | 'admin'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isEvaluatorOpen, setIsEvaluatorOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  const { isCitationOpen, closeCitation, selectedCitation, sendMessage, setActiveCategory } = useChat();
  const { isAdmin } = useAuth();

  const handleSelectQuestionForChat = (question) => {
    setActiveView('chat');
    sendMessage(question);
  };

  const handleSelectBenchmark = (query, category) => {
    setActiveView('chat');
    if (category && category !== 'General') {
      setActiveCategory(category);
    }
    sendMessage(query);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0b0f17] text-slate-800 dark:text-slate-100 selection:bg-sky-500/30 selection:text-sky-700 dark:selection:text-sky-200 transition-colors duration-200">
      
      {/* Top Navigation */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenEvaluator={() => setIsEvaluatorOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex relative overflow-hidden">
        
        {/* Mobile Sidebar Trigger */}
        {activeView === 'chat' && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden fixed bottom-20 left-4 z-30 p-3 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xl shadow-sky-500/30"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Sidebar (Chat View Only) */}
        {activeView === 'chat' && (
          <Sidebar
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
          />
        )}

        {/* Backdrop for Mobile Sidebar */}
        {isSidebarOpen && activeView === 'chat' && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          />
        )}

        {/* Dynamic View: Chat Interface or Admin Dashboard */}
        {activeView === 'chat' ? (
          <ChatInterface onOpenEvaluator={() => setIsEvaluatorOpen(true)} />
        ) : isAdmin ? (
          <AdminDashboard onSelectQuestionForChat={handleSelectQuestionForChat} />
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 text-center text-slate-400">
            <p>Admin privileges required to view the console.</p>
          </div>
        )}

      </div>

      {/* Citation Inspector Drawer */}
      <CitationDrawer
        isOpen={isCitationOpen}
        onClose={closeCitation}
        citation={selectedCitation}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Evaluator Benchmark Demo Suite Modal */}
      <EvaluatorModal
        isOpen={isEvaluatorOpen}
        onClose={() => setIsEvaluatorOpen(false)}
        onSelectBenchmark={handleSelectBenchmark}
      />

      {/* Campus Emergency Helplines Directory Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

    </div>
  );
}
