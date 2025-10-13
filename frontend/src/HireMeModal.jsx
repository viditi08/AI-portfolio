import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './HireMeModal.css';

Modal.setAppElement('#root');

const HireMeModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen) {
      // Set an initial welcome message when the modal opens
      setMessages([{
        sender: 'ai',
        text: "Hi there! I'm Viditi's AI assistant. How can I help you learn more about her professional background?"
      }]);
    } else {
      // Clear messages when modal closes to reset it
      setMessages([]);
    }
  }, [isOpen]);

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = { text: messageText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/ask', { question: messageText });
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

  const initialPrompts = ["How can I contact you?", "Tell me about a challenging project", "What's your experience with AI?"];

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Hire Me Modal"
      className="hire-modal-content"
      overlayClassName="hire-modal-overlay"
    >
      <div className="hire-modal-scroll-container">
        <button onClick={onClose} className="hire-modal-close-btn">×</button>
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
            <li>Product First thinking and User centered design</li>
            <li>Built feature for JPMorgan that saved $500k/quarter</li>
          </ul>
        </div>

        <div className="modal-actions">
          <a href="mailto:viditivartak08@gmail.com" className="action-btn primary">Contact Me</a>
          <a href="/Viditi-Vartak-Resume.pdf" target="_blank" rel="noopener noreferrer" className="action-btn secondary">View Resume</a>
        </div>
      </div>

      <div className="embedded-chat-interface">
        <div className="chat-messages-container">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message-bubble ${msg.sender}`}><ReactMarkdown children={msg.text} /></div>
          ))}
          {isLoading && <div className="chat-message-bubble ai typing-indicator"><span /><span /><span /></div>}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-area">
          <div className="chat-suggestions">
            {initialPrompts.map((p) => <button key={p} onClick={() => sendMessage(p)}>{p}</button>)}
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
    </Modal>
  );
};

export default HireMeModal;