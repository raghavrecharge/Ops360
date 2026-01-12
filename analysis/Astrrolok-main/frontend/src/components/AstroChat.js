import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Send, Loader2, BookOpen, Trash2, Plus, ChevronRight } from 'lucide-react';
import './AstroChat.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

function AstroChat() {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const loadSessions = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/chat/sessions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const createNewSession = async () => {
    setCurrentSession(null);
    setMessages([]);
  };

  const loadSession = async (sessionId) => {
    setCurrentSession(sessionId);
    setLoadingHistory(true);
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/chat/sessions/${sessionId}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error('Error loading history:', error);
    }
    
    setLoadingHistory(false);
  };

  const deleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation?')) return;

    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/chat/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (currentSession === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
      loadSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    const token = localStorage.getItem('token');
    const userMessage = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    // Add user message immediately
    const tempUserMsg = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await fetch(`${API_URL}/api/chat/ask`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          session_id: currentSession
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Update session if new one was created
        if (!currentSession && data.session_id) {
          setCurrentSession(data.session_id);
          loadSessions();
        }

        // Add assistant response
        const assistantMsg = {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.answer,
          citations: data.citations,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        // Show error
        const errorMsg = {
          id: Date.now() + 1,
          role: 'assistant',
          content: `Error: ${data.detail || 'Failed to get response'}`,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (error) {
      const errorMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Error: ${error.message}`,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    }

    setSending(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatCitations = (citations) => {
    if (!citations || citations.length === 0) return null;
    
    return (
      <div className="citations">
        <span className="citations-label">
          <BookOpen size={14} /> Sources:
        </span>
        {citations.map((cite, idx) => (
          <span key={idx} className="citation-badge">
            [{cite.index}] {cite.source_name}
            {cite.page_number && ` (p.${cite.page_number})`}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="astro-chat" data-testid="astro-chat">
      {/* Sidebar */}
      <div className="chat-sidebar" data-testid="chat-sidebar">
        <button 
          onClick={createNewSession}
          className="btn-new-chat"
          data-testid="new-chat-btn"
        >
          <Plus size={18} /> New Chat
        </button>

        <div className="sessions-list">
          {sessions.map(session => (
            <div 
              key={session.id}
              className={`session-item ${currentSession === session.id ? 'active' : ''}`}
              onClick={() => loadSession(session.id)}
              data-testid={`session-${session.id}`}
            >
              <MessageCircle size={16} />
              <span className="session-preview">{session.preview}</span>
              <button 
                onClick={(e) => deleteSession(session.id, e)}
                className="btn-delete-session"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="no-sessions">No conversations yet</p>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-main" data-testid="chat-main">
        <div className="chat-header">
          <h2><MessageCircle size={24} /> AstroOS Knowledge Assistant</h2>
          <p>Ask questions about Vedic astrology, yogas, doshas, and more</p>
        </div>

        <div className="messages-container" data-testid="messages-container">
          {loadingHistory ? (
            <div className="loading-history">
              <Loader2 className="spinning" size={24} />
              <span>Loading conversation...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="welcome-message">
              <div className="welcome-icon">✨</div>
              <h3>Welcome to AstroOS Knowledge Assistant</h3>
              <p>I can answer questions about:</p>
              <ul>
                <li><ChevronRight size={14} /> Vedic astrology concepts and principles</li>
                <li><ChevronRight size={14} /> Yogas, doshas, and planetary combinations</li>
                <li><ChevronRight size={14} /> Dasha systems and prediction methods</li>
                <li><ChevronRight size={14} /> Remedies (gemstones, mantras, rituals)</li>
                <li><ChevronRight size={14} /> Chart interpretation guidelines</li>
              </ul>
              <p className="welcome-note">
                My answers are based on your uploaded knowledge base.
                For best results, upload relevant texts first.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div 
                key={msg.id || idx}
                className={`message ${msg.role}`}
                data-testid={`message-${idx}`}
              >
                <div className="message-avatar">
                  {msg.role === 'user' ? '👤' : '🔮'}
                </div>
                <div className="message-content">
                  <div className="message-text">{msg.content}</div>
                  {msg.citations && formatCitations(msg.citations)}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container" data-testid="chat-input-container">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about astrology..."
            rows={2}
            disabled={sending}
            data-testid="chat-input"
          />
          <button 
            onClick={sendMessage}
            disabled={sending || !inputMessage.trim()}
            className="btn-send"
            data-testid="send-btn"
          >
            {sending ? <Loader2 className="spinning" size={20} /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AstroChat;
