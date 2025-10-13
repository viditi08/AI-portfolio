import React, { useState } from 'react';
import axios from 'axios';
import AboutModal from './AboutModal';
import FluidBackground from './FluidBackground';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false);

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    if (!isChatMode) {
      setIsChatMode(true);
    }

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

  const resetToHome = () => {
    setMessages([]);
    setCurrentPage('home');
    setInput('');
    setIsChatMode(false);
  };

  const handleNavClick = (page) => {
    setCurrentPage(page);
    setMessages([]);
    setInput('');
    setIsChatMode(false);
  };

  const suggestions = currentPage === 'home' ? 
    ["Favorite Project", "Something Interesting", "Let's start with a joke"] :
    currentPage === 'hire' ?
    ["What are your salary expectations?", "When can you start?", "Tell me about your experience"] :
    currentPage === 'contact' ?
    ["What's the best way to reach you?", "How quickly do you respond?", "What's your time zone?"] :
    ["What are your key skills?", "Tell me about your experience", "What projects have you worked on?"];

  if (currentPage === 'hire') {
    return (
      <div className="App">
        <FluidBackground />
        {/* Navigation */}
        <nav className="top-nav">
          <div className="nav-left">
            <a href="#" onClick={() => handleNavClick('home')} className="logo">Viditi Vartak</a>
          </div>
          <div className="nav-links">
            <a href="#" onClick={() => handleNavClick('hire')} className="active">Looking to hire?</a>
            <a href="#" onClick={() => handleNavClick('contact')}>Contact</a>
            <a href="#" onClick={() => handleNavClick('resume')}>Resume</a>
          </div>
          <div className="nav-right">
            <a href="https://www.linkedin.com/in/viditi-vartak" target="_blank" rel="noopener noreferrer" className="linkedin-btn">
              Connect on LinkedIn
            </a>
          </div>
        </nav>

        {/* Hire Page Content */}
        <div className="hire-page">
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">Looking to Hire?</h1>
              <p className="hero-subtitle">Let's discuss how I can contribute to your team</p>
              
              <div className="info-cards">
                <div className="info-card">
                  <h3>🚀 What I bring</h3>
                  <p>Full-stack development expertise with modern technologies, AI/ML integration, and strong problem-solving skills.</p>
                </div>
                <div className="info-card">
                  <h3>💼 What I'm looking for</h3>
                  <p>Innovative projects in collaborative environments with opportunities for growth and meaningful impact.</p>
                </div>
                <div className="info-card">
                  <h3>📫 Let's connect</h3>
                  <div className="quick-contact">
                    <a href="mailto:viditivartak08@gmail.com" className="contact-link">📧 Email</a>
                    <a href="https://www.linkedin.com/in/viditivartak/" target="_blank" rel="noopener noreferrer" className="contact-link">💼 LinkedIn</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Section */}
          {!isChatMode ? (
            <div className="chat-section">
              <div className="suggestions">
                {suggestions.map((suggestion, index) => (
                  <button 
                    key={index} 
                    className="suggestion-pill" 
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isLoading}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              
              <div className="input-section">
                <form className="input-form" onSubmit={handleSubmit}>
                  <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="Ask about hiring opportunities..."
                    className="chat-input"
                    disabled={isLoading}
                  />
                  <button 
                    type="submit" 
                    className="send-btn" 
                    disabled={isLoading || !input.trim()}
                  >
                    →
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="chat-container">
              <div className="messages">
                {messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.sender}`}>
                    <div className="message-content">
                      {msg.text}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="message ai">
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="input-section">
                <form className="input-form" onSubmit={handleSubmit}>
                  <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="Ask about hiring opportunities..."
                    className="chat-input"
                    disabled={isLoading}
                  />
                  <button 
                    type="submit" 
                    className="send-btn" 
                    disabled={isLoading || !input.trim()}
                  >
                    →
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* About Modal */}
        <AboutModal 
          isOpen={isAboutModalOpen} 
          onClose={() => setIsAboutModalOpen(false)} 
        />
      </div>
    );
  }

  if (currentPage === 'contact') {
    return (
      <div className="App">
        <FluidBackground />
        {/* Navigation */}
        <nav className="top-nav">
          <div className="nav-left">
            <a href="#" onClick={() => handleNavClick('home')} className="logo">Viditi Vartak</a>
          </div>
          <div className="nav-links">
            <a href="#" onClick={() => handleNavClick('hire')}>Looking to hire?</a>
            <a href="#" onClick={() => handleNavClick('contact')} className="active">Contact</a>
            <a href="#" onClick={() => handleNavClick('resume')}>Resume</a>
          </div>
          <div className="nav-right">
            <a href="https://www.linkedin.com/in/viditi-vartak" target="_blank" rel="noopener noreferrer" className="linkedin-btn">
              Connect on LinkedIn
            </a>
          </div>
        </nav>

        {/* Contact Page Content */}
        <div className="contact-page">
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">Let's Connect</h1>
              <p className="hero-subtitle">Get in touch with me through various channels</p>
              
              <div className="contact-info">
                <div className="contact-card">
                  <span className="contact-icon">📧</span>
                  <div>
                    <strong>Email</strong>
                    <a href="mailto:viditivartak08@gmail.com">viditivartak08@gmail.com</a>
                  </div>
                </div>
                <div className="contact-card">
                  <span className="contact-icon">💼</span>
                  <div>
                    <strong>LinkedIn</strong>
                    <a href="https://www.linkedin.com/in/viditivartak/" target="_blank" rel="noopener noreferrer">linkedin.com/in/viditivartak</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Section */}
          {!isChatMode ? (
            <div className="chat-section">
              <div className="suggestions">
                {suggestions.map((suggestion, index) => (
                  <button 
                    key={index} 
                    className="suggestion-pill" 
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isLoading}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              
              <div className="input-section">
                <form className="input-form" onSubmit={handleSubmit}>
                  <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="Ask about contact information..."
                    className="chat-input"
                    disabled={isLoading}
                  />
                  <button 
                    type="submit" 
                    className="send-btn" 
                    disabled={isLoading || !input.trim()}
                  >
                    →
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="chat-container">
              <div className="messages">
                {messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.sender}`}>
                    <div className="message-content">
                      {msg.text}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="message ai">
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="input-section">
                <form className="input-form" onSubmit={handleSubmit}>
                  <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="Ask about contact information..."
                    className="chat-input"
                    disabled={isLoading}
                  />
                  <button 
                    type="submit" 
                    className="send-btn" 
                    disabled={isLoading || !input.trim()}
                  >
                    →
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* About Modal */}
        <AboutModal 
          isOpen={isAboutModalOpen} 
          onClose={() => setIsAboutModalOpen(false)} 
        />
      </div>
    );
  }

  if (currentPage === 'resume') {
    return (
      <div className="App">
        <FluidBackground />
        {/* Navigation */}
        <nav className="top-nav">
          <div className="nav-left">
            <a href="#" onClick={() => handleNavClick('home')} className="logo">Viditi Vartak</a>
          </div>
          <div className="nav-links">
            <a href="#" onClick={() => handleNavClick('hire')}>Looking to hire?</a>
            <a href="#" onClick={() => handleNavClick('contact')}>Contact</a>
            <a href="#" onClick={() => handleNavClick('resume')} className="active">Resume</a>
          </div>
          <div className="nav-right">
            <a href="https://www.linkedin.com/in/viditi-vartak" target="_blank" rel="noopener noreferrer" className="linkedin-btn">
              Connect on LinkedIn
            </a>
          </div>
        </nav>

        {/* Resume Page Content */}
        <div className="resume-page">
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">My Resume</h1>
              <p className="hero-subtitle">Learn about my professional background</p>
              
              <div className="skills-grid">
                <div className="skill-card">
                  <h4>Frontend</h4>
                  <p>React, JavaScript, HTML5, CSS3</p>
                </div>
                <div className="skill-card">
                  <h4>Backend</h4>
                  <p>Node.js, Python, FastAPI, Java</p>
                </div>
                <div className="skill-card">
                  <h4>Cloud & DevOps</h4>
                  <p>AWS, Docker, Kubernetes, Jenkins</p>
                </div>
              </div>
              
              <a href="/Viditi-Vartak-Resume.pdf" target="_blank" className="download-btn">
                📄 Download Resume
              </a>
            </div>
          </div>

          {/* Chat Section */}
          {!isChatMode ? (
            <div className="chat-section">
              <div className="suggestions">
                {suggestions.map((suggestion, index) => (
                  <button 
                    key={index} 
                    className="suggestion-pill" 
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isLoading}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              
              <div className="input-section">
                <form className="input-form" onSubmit={handleSubmit}>
                  <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="Ask about my background..."
                    className="chat-input"
                    disabled={isLoading}
                  />
                  <button 
                    type="submit" 
                    className="send-btn" 
                    disabled={isLoading || !input.trim()}
                  >
                    →
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="chat-container">
              <div className="messages">
                {messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.sender}`}>
                    <div className="message-content">
                      {msg.text}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="message ai">
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="input-section">
                <form className="input-form" onSubmit={handleSubmit}>
                  <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="Ask about my background..."
                    className="chat-input"
                    disabled={isLoading}
                  />
                  <button 
                    type="submit" 
                    className="send-btn" 
                    disabled={isLoading || !input.trim()}
                  >
                    →
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* About Modal */}
        <AboutModal 
          isOpen={isAboutModalOpen} 
          onClose={() => setIsAboutModalOpen(false)} 
        />
      </div>
    );
  }

  // Home page (default)
  return (
    <div className="App">
      <FluidBackground />
      {/* Navigation */}
      <nav className="top-nav">
        <div className="nav-links">
          <a href="#" onClick={() => handleNavClick('hire')}>Looking to hire?</a>
          <a href="#" onClick={() => handleNavClick('contact')}>Contact</a>
          <a href="#" onClick={() => handleNavClick('resume')}>Resume</a>
        </div>
        <div className="nav-right">
          <a href="https://www.linkedin.com/in/viditi-vartak" target="_blank" rel="noopener noreferrer" className="linkedin-btn">
            Connect on LinkedIn
          </a>
        </div>
      </nav>

      {!isChatMode ? (
        <div className="home-container">
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title" onClick={() => handleNavClick('home')} style={{cursor: 'pointer'}}>Viditi Ai Portfolio</h1>
              <p className="hero-subtitle">Built using data from my life.</p>
              
              {/* Hero Image/Animation Area */}
              <div className="hero-image-container">
                <img src="/avatar.png" alt="Viditi Vartak" className="hero-avatar" />
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="chat-section">
            <div className="suggestions">
              {suggestions.map((suggestion, index) => (
                <button 
                  key={index} 
                  className="suggestion-pill" 
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isLoading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
            
            <div className="input-section">
              <form className="input-form" onSubmit={handleSubmit}>
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder="Ask me anything..."
                  className="chat-input"
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  className="send-btn" 
                  disabled={isLoading || !input.trim()}
                >
                  →
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="chat-container">
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <div className="message-content">
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message ai">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="input-section">
            <form className="input-form" onSubmit={handleSubmit}>
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="Ask me anything..."
                className="chat-input"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="send-btn" 
                disabled={isLoading || !input.trim()}
              >
                →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* About Modal */}
      <AboutModal 
        isOpen={isAboutModalOpen} 
        onClose={() => setIsAboutModalOpen(false)} 
      />
    </div>
  );
}

export default App;