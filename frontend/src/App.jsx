import React, { useState, useEffect, useRef } from 'react';
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

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('home'); // This state controls which page is visible
  const [isChatMode, setIsChatMode] = useState(false);

  // Auto-scroll to bottom when new messages arrive (Home chat)
  const messageListRef = useRef(null);
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const endChat = () => {
    setMessages([]);
    setInput('');
    setIsChatMode(false);
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;
    if (!isChatMode && currentPage === 'home') setIsChatMode(true);

    const userMessage = { text: messageText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('/ask', {
        question: messageText,
      });
      const aiMessage = { text: response.data.answer, sender: 'ai' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { text: "Sorry, I'm having trouble connecting to the AI brain right now.", sender: 'ai' };
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

  const handleNavClick = (page) => {
    setCurrentPage(page);
  };

  const suggestions = [
      "Favorite Project",
      "Something Interesting",
      "Let's start with a joke"
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
      <nav className="top-nav">
        <div className="brand" onClick={() => handleNavClick('home')}>Viditi Vartak</div>
        {!isChatMode && (
          <div className="nav-links">
            <a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('hire'); }}>
              <span className="nav-dot" style={{backgroundColor: '#3b82f6'}}></span>Looking to hire?
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('contact'); }}>
              <span className="nav-dot" style={{backgroundColor: '#10b981'}}></span>Contact
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('resume'); }}>
              <span className="nav-dot" style={{backgroundColor: '#f59e0b'}}></span>Resume
            </a>
          </div>
        )}
        <div className="nav-right">
          <a href="https://www.linkedin.com/in/viditi-vartak" target="_blank" rel="noopener noreferrer" className="linkedin-icon top">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" width="22" height="22"><path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/></svg>
          </a>
        </div>
      </nav>

      {!isChatMode ? (
        <div className="home-container">
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">Viditi Ai Portfolio</h1>
              <p className="hero-subtitle">Built using data from my life.</p>
              <img src="/avatar.png" alt="Viditi Vartak" className="hero-avatar" />
            </div>
          </div>

          <div className="chat-section">
             <form className="input-form" onSubmit={handleSubmit}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hi, I'm Viditi, ask me anything..."
                className="chat-input"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="send-btn"
                disabled={isLoading || !input.trim()}
              >→</button>
            </form>
            <div className="suggestions">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-pill"
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isLoading}
                >{suggestion}</button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="chat-view-container">
          {/* Close chat (X) like other pages */}
          <button className="home-chat-close-btn" onClick={endChat} aria-label="Close chat" disabled={isLoading}>×</button>
          <div className="message-list" ref={messageListRef}>
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
          {/* Always show typing input in chat mode */}
          <form className="chat-view-input" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading}
            />
            <button type="submit" disabled={!input.trim() || isLoading}>→</button>
          </form>
        </div>
      )}
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
        </AnimatePresence>
    </div>
  );
}

export default App;