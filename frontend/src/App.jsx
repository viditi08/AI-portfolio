import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion'; // For animations
import FluidBackground from './FluidBackground';
import './App.css';
import HirePage from './HirePage.jsx';       // Make sure this is imported
import ContactPage from './ContactPage.jsx';   // Make sure this is imported
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ResumePage from './ResumePage.jsx'; 
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { askUrl } from './api.js';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('home'); // This state controls which page is visible
  const [isChatMode, setIsChatMode] = useState(false);

  // Add hash-based routing for #/home, #/chat, etc.
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash || '#/home';
      const page = hash.replace('#/', '') || 'home';
      setCurrentPage(page);
    };
    window.addEventListener('hashchange', parseHash);
    parseHash(); // initialize on mount
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;
    if (!isChatMode && currentPage === 'home') setIsChatMode(true);

    // Ensure we are on the dedicated chat route when a message is sent
    if (currentPage !== 'chat') {
      window.location.hash = '/chat';
    }

    const userMessage = { text: messageText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(askUrl(), {
        question: messageText,
      });
      const aiMessage = { text: response.data.answer, sender: 'ai' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { text: "Sorry, I'm having trouble connecting right now.", sender: 'ai' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  // Navigate via hash so URL reflects the route
  const handleNavClick = (page) => {
    window.location.hash = `/${page}`;
  };

  // Close chat: clear messages and return home
  const handleCloseChat = () => {
    setMessages([]);
    setInput('');
    setIsChatMode(false);
    window.location.hash = '/home';
  };

  const suggestions = [
      "Give me your 30-second pitch",
      "What tech stack do you use?",
    ];

  const MessageBubble = ({ msg }) => (
    <div className={`msg-bubble ${msg.sender === 'user' ? 'user' : 'ai'}`}>
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        components={{
          code({node, inline, className, children, ...props}) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter style={oneLight} language={match[1]} PreTag="div" {...props}>
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>{children}</code>
            );
          }
        }}
      >
        {msg.text}
      </ReactMarkdown>
    </div>
  );

  const renderHomePage = () => (
    <motion.div
      key="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Hide top nav when in chat mode */}
      {!isChatMode && (
        <nav className="top-nav">
          <div className="brand" onClick={() => handleNavClick('home')}>
            {/* Brand only; removed top-left LinkedIn icon */}
            <span>Viditi Vartak</span>
          </div>
          <div className="nav-links">
            <a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('hire'); }}>
              <span className="nav-dot" style={{backgroundColor: '#3b82f6'}}></span> Why Hire Me 
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('contact'); }}>
               <span className="nav-dot" style={{backgroundColor: '#10b981'}}></span>Contact 
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('resume'); }}>
               <span className="nav-dot" style={{backgroundColor: '#f59e0b'}}></span>Resume 
            </a>
            {/* Removed LinkedIn text link from nav */}
          </div>
          <div className="nav-right">
            <a href="https://www.linkedin.com/in/viditivartak/" target="_blank" rel="noopener noreferrer" className="linkedin-icon top" title="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" width="22" height="22"><path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/></svg>
            </a>
          </div>
        </nav>
      )}

      {!isChatMode ? (
        <div className="home-container">
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">Viditi Vartak</h1>
              <p className="hero-subtitle">Crafting Experiences with Purpose.</p>
              <img src="/avatar.png" alt="Viditi Vartak" className="hero-avatar" />
            </div>
          </div>

          <div className="chat-section">
            {/* Fixed suggestions above input */}
            <div className="suggestions suggestions-fixed">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-pill"
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isLoading}
                >{suggestion}</button>
              ))}
            </div>
            <form className="input-form" onSubmit={handleSubmit}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about my frontend work..."
                className="chat-input"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="send-btn"
                disabled={isLoading || !input.trim()}
              >→</button>
            </form>
          </div>
        </div>
      ) : (
        <div className="chat-view-container">
          {/* Back/Close (×) button to exit chat and go home */}
          <button
            type="button"
            onClick={handleCloseChat}
            aria-label="Back to Home"
            title="Back to Home"
            style={{
              position: 'fixed',
              top: 16,
              left: 16,
              zIndex: 1000,
              width: 36,
              height: 36,
              borderRadius: '9999px',
              border: 'none',
              background: 'rgba(255,255,255,0.85)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              lineHeight: '20px',
              cursor: 'pointer',
              color: '#111827',
              backdropFilter: 'blur(8px)'
            }}
          >
            ×
          </button>

          <div className="message-list">
            {messages.map((m, idx) => (
              <div key={idx} className={`message-row ${m.sender}`}>
                {m.sender === 'ai' && (
                  <img className="avatar ai" src="/avatar.png" alt="Viditi avatar" />
                )}
                <MessageBubble msg={m} />
              </div>
            ))}
            {isLoading && <div className="typing">Thinking…</div>}
          </div>
          {/* Suggestions removed on chat page */}
          {/* <div className="suggestions suggestions-fixed"> ... </div> */}
          <form className="input-form chat-view-input" onSubmit={handleSubmit}>
            <input
              type="text"
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about my frontend work..."
              disabled={isLoading}
            />
            <button
              type="submit"
              className="send-btn"
              disabled={!input.trim() || isLoading}
            >
              →
            </button>
          </form>
        </div>
      )}
    </motion.div>
  );

  // Dedicated Chat Page with a back (×) button
  const renderChatPage = () => (
    <motion.div
      key="chat"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top bar with Close (×) button to go back to home */}
      <button
        aria-label="Close chat"
        title="Close chat"
        onClick={handleCloseChat}
        className="chat-close-btn"
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 1000,
          width: 36,
          height: 36,
          borderRadius: '9999px',
          border: 'none',
          background: 'rgba(0,0,0,0.45)',
          color: '#fff',
          fontSize: 20,
          lineHeight: '36px',
          cursor: 'pointer',
          backdropFilter: 'blur(4px)'
        }}
      >
        &times;
      </button>

      <div className="chat-view-container">
        <div className="message-list">
          {messages.map((m, idx) => (
            <div key={idx} className={`message-row ${m.sender}`}>
              {m.sender === 'ai' && (
                <img className="avatar ai" src="/avatar.png" alt="Viditi avatar" />
              )}
              <MessageBubble msg={m} />
            </div>
          ))}
          {isLoading && <div className="typing">Thinking…</div>}
        </div>
        {/* Suggestions removed on chat page */}
        {/* <div className="suggestions suggestions-fixed"> ... </div> */}
        <form className="input-form chat-view-input" onSubmit={handleSubmit}>
          <input
            type="text"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about my frontend work..."
            disabled={isLoading}
          />
          <button
            type="submit"
            className="send-btn"
            disabled={!input.trim() || isLoading}
          >
            →
          </button>
        </form>
      </div>
    </motion.div>
  );

  return (
    <div className="App">
        {currentPage === 'home' && <FluidBackground />}
        <AnimatePresence mode="wait">
          {currentPage === 'home' && renderHomePage()}
          {currentPage === 'contact' && (
            <ContactPage key="contact" onClose={() => setCurrentPage('home')} />
          )}
          {currentPage === 'hire' && (
            <HirePage key="hire" onClose={() => setCurrentPage('home')} />
          )}
          {currentPage === 'resume' && (
            <ResumePage key="resume" onClose={() => setCurrentPage('home')} />
          )}
          {currentPage === 'chat' && renderChatPage()}
        </AnimatePresence>

        {/* Bottom LinkedIn icon/link (hidden in chat to avoid overlap) */}
        {currentPage !== 'chat' && (
          <a
            href="https://www.linkedin.com/in/viditivartak/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            title="LinkedIn"
            style={{
              position: 'fixed',
              bottom: 16,
              left: 16,
              width: 44,
              height: 44,
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(17,24,39,0.6)',
              color: '#fff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
              backdropFilter: 'blur(6px)',
              zIndex: 900,
              textDecoration: 'none'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" width="22" height="22"><path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/></svg>
          </a>
        )}

        {/* Removed global bottom-right LinkedIn icon */}
    </div>
  );
}

export default App;