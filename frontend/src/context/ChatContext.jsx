import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeDepartment, setActiveDepartment] = useState('All');
  const [activeLanguage, setActiveLanguage] = useState('en');
  
  // Modals & Drawers state
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [isCitationOpen, setIsCitationOpen] = useState(false);

  // Load user conversations on login / user change
  const refreshConversations = useCallback(async () => {
    try {
      const res = await api.getConversations();
      if (res.success) {
        setConversations(res.conversations || []);
      }
    } catch (err) {
      console.warn('Error loading conversations:', err.message);
    }
  }, []);

  useEffect(() => {
    refreshConversations();
  }, [user, refreshConversations]);

  // Load messages when active conversation changes
  useEffect(() => {
    async function loadMessages() {
      if (activeConversationId) {
        try {
          const res = await api.getMessages(activeConversationId);
          if (res.success) {
            setMessages(res.messages || []);
          }
        } catch (err) {
          console.error('Error fetching messages for conversation:', err);
        }
      } else {
        setMessages([]);
      }
    }
    loadMessages();
  }, [activeConversationId]);

  const selectConversation = (id) => {
    setActiveConversationId(id);
  };

  const createNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
  };

  const deleteConversation = async (id) => {
    try {
      await api.deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConversationId === id) {
        createNewChat();
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  // Send student question
  const sendMessage = async (text) => {
    if (!text || !text.trim() || loading) return;

    const trimmed = text.trim();
    const tempUserMsg = {
      id: `temp_user_${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await api.askQuestion(
        trimmed,
        activeConversationId,
        activeCategory,
        activeDepartment
      );

      if (res.success) {
        if (!activeConversationId) {
          setActiveConversationId(res.conversationId);
          await refreshConversations();
        }
        setMessages(prev => {
          // Replace temp or append
          const filtered = prev.filter(m => m.id !== tempUserMsg.id);
          return [...filtered, tempUserMsg, res.message];
        });
      }
    } catch (err) {
      console.error('Failed to send question:', err);
      const errorMsg = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Error: ${err.message || 'Could not connect to the campus AI server.'}`,
        sources: [],
        confidenceScore: 0,
        unknownFlag: true,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (messageId, rating, reason = '', comment = '') => {
    try {
      await api.submitFeedback(messageId, activeConversationId, rating, reason, comment);
      setMessages(prev =>
        prev.map(m =>
          m.id === messageId
            ? { ...m, feedback: { rating, reason } }
            : m
        )
      );
      return true;
    } catch (err) {
      console.error('Error submitting feedback:', err);
      return false;
    }
  };

  const openCitation = (source) => {
    setSelectedCitation(source);
    setIsCitationOpen(true);
  };

  const closeCitation = () => {
    setSelectedCitation(null);
    setIsCitationOpen(false);
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversationId,
        messages,
        loading,
        activeCategory,
        setActiveCategory,
        activeDepartment,
        setActiveDepartment,
        activeLanguage,
        setActiveLanguage,
        selectedCitation,
        isCitationOpen,
        openCitation,
        closeCitation,
        selectConversation,
        createNewChat,
        deleteConversation,
        sendMessage,
        submitFeedback,
        refreshConversations
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
}
