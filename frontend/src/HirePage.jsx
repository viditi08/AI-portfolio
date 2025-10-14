import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './HirePage.css';

const HirePage = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return;
    setMessages(prev => [...prev, { text: messageText, sender: 'user' }]);
    setInput('');
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/ask', { question: messageText });
      setMessages(prev => [...prev, { text: response.data.answer, sender: 'ai' }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting.", sender: 'ai' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const initialPrompts = ["How can I contact you?", "Tell me about a challenging project", "What's your experience with AI?"];

  return (
    <motion.div
      className="hire-page-wrapper"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="hire-page-top-bar">
        <button className="top-hire-button">Looking for a talent?</button>
        <button onClick={onClose} className="hire-page-close-btn">×</button>
      </div>

      <div className="hire-page-scroll-container">
        <div className="hire-card-container">
          <div className="profile-header">
            <img src="/avatar.png" alt="Viditi Vartak" className="profile-avatar" />
            <div className="profile-info">
              <h2 className="profile-name">Viditi Vartak</h2>
              <p className="profile-title">AI & Full-Stack Engineer</p>
            </div>
            <div className="status-badge">Open to opportunities</div>
          </div>
          <div className="details-grid">
            <div><span>Duration</span>Full-time - Immediate</div>
            <div><span>Location</span>San Jose, CA - Remote friendly</div>
          </div>
          <div className="detail-section">
            <h3><span role="img" aria-label="code">💻</span> Tech Stack</h3>
            <div className="tech-stack-grid">
              <ul><li>Java</li><li>Next.js</li><li>Spring Boot</li><li>AWS</li></ul>
              <ul><li>Python</li><li>Docker</li><li>JavaScript</li><li>Kubernetes</li></ul>
              <ul><li>React.js</li><li>Apache Spark</li><li>Node.js</li><li>MongoDB</li></ul>
            </div>
          </div>
          <div className="detail-section">
            <h3><span role="img" aria-label="checkmark">✔️</span> What I Bring</h3>
            <ul className="value-list">
              <li>Shipped production AI features</li>
              <li>Full Stack Development experience</li>
              <li>Hackathons + rapid prototyping</li>
              <li>Product-first thinking and User-centered design</li>
            </ul>
          </div>
          <div className="modal-actions">
            <a href="mailto:viditivartak08@gmail.com" className="action-btn primary">Contact Me</a>
            <a href="/Viditi-Vartak-Resume.pdf" target="_blank" rel="noopener noreferrer" className="action-btn secondary">View Resume</a>
          </div>
        </div>
      </div>

      <div className="bottom-chat-interface">
        <div className="chat-input-area">
          <div className="chat-suggestions">
            {initialPrompts.map((p) => (
              <button key={p} onClick={() => sendMessage(p)} disabled={isLoading}>{p}</button>
            ))}
          </div>
          <form className="chat-input-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What else would you like to know?"
              disabled={isLoading}
            />
            <button type="submit" disabled={!input.trim() || isLoading}>→</button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default HirePage;