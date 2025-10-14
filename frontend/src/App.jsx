import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion'; // For animations
import FluidBackground from './FluidBackground';
import './App.css';
import HirePage from './HirePage.jsx';       // Make sure this is imported
import ContactPage from './ContactPage.jsx';   // Make sure this is imported
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ResumePage from './ResumePage.jsx'; 

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('home'); // This state controls which page is visible
  const [isChatMode, setIsChatMode] = useState(false);
  
  // The 'isHireModalOpen' state is no longer needed because 'HirePage' is a full page, not a modal.
  // We will remove it.

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;
    if (!isChatMode) setIsChatMode(true);

    const userMessage = { text: messageText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/ask', {
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

  // --- CORRECTED function to handle page switching for all links ---
  const handleNavClick = (page) => {
    setCurrentPage(page);
  };

  const suggestions = [
      "Favorite Project",
      "Something Interesting",
      "Let's start with a joke"
  ];

  // This is your existing home page content, now correctly used
  const renderHomePage = () => (
    <motion.div
      key="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <nav className="top-nav">
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
        <div className="nav-right">
             <button className="info-icon" title="About this page">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" width="20" height="20"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-144c-17.7 0-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32z"/></svg>
             </button>
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
          <footer className="home-footer">
            <a href="https://www.linkedin.com/in/viditi-vartak" target="_blank" rel="noopener noreferrer" className="linkedin-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" width="24" height="24"><path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/></svg>
            </a>
          </footer>
        </div>
      ) : (
        <div className="chat-view-container">
           {/* Your main chat view will render here */}
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="App">
        <FluidBackground />
        <AnimatePresence mode="wait">
          {currentPage === 'home' && renderHomePage()}
          {currentPage === 'contact' && <ContactPage key="contact" onClose={() => setCurrentPage('home')} />}
          {currentPage === 'hire' && <HirePage key="hire" onClose={() => setCurrentPage('home')} />}
          {currentPage === 'resume' && <ResumePage key="resume" onClose={() => setCurrentPage('home')} />}
        </AnimatePresence>
        
        {/* The HireMeModal component is no longer used for a full page and can be removed if you don't need it as a pop-up elsewhere */}
    </div>
  );
}

export default App;