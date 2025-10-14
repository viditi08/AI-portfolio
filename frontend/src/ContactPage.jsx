import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './ContactPage.css';

const ContactPage = ({ onClose }) => {
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

  const initialPrompts = ["Tell me about your projects", "What technologies do you work with?", "Are you open to opportunities?"];

  return (
    <motion.div
      className="contact-page-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* --- SECTION 1: TOP BAR --- */}
      <div className="contact-page-top-bar">
        <div className="contact-query-bubble">How can I contact you?</div>
        <button onClick={onClose} className="contact-page-close-btn">×</button>
      </div>

      {/* --- SECTION 2: SCROLLABLE CONTENT --- */}
      <div className="contact-content-area">
        <div className="contact-card-container">
          <div className="contact-card-header">
              <img src="/avatar.png" alt="Viditi Vartak" />
              <div>
                  <h2>Get in touch</h2>
                  <p>Viditi Vartak</p>
              </div>
              <span className="responsive-badge">Responsive</span>
          </div>
          <div className="contact-details-grid">
              <div className="contact-card-item">
                  <span>📧</span>
                  <div><strong>Email</strong><a href="mailto:viditivartak08@gmail.com">viditivartak08@gmail.com</a></div>
              </div>
              <div className="contact-card-item">
                  <span>📞</span>
                  <div><strong>Phone</strong><a href="tel:+16575258975">+1 (657) 525-8975</a></div>
              </div>
              <div className="contact-card-item">
                  <span>📍</span>
                  <div><strong>Location</strong><p>San Jose, California</p></div>
              </div>
              <div className="contact-card-item">
                  <span>🔗</span>
                  <div><strong>LinkedIn</strong><a href="https://linkedin.com/in/viditivartak" target="_blank" rel="noopener noreferrer">linkedin.com/in/viditivartak</a></div>
              </div>
          </div>
        </div>
      </div>

      {/* --- SECTION 3: BOTTOM CHAT INTERFACE --- */}
      <div className="bottom-chat-interface">
        <div className="chat-input-area">
          <div className="chat-suggestions">
            {initialPrompts.map((p) => (
              <button key={p} onClick={() => sendMessage(p)} disabled={isLoading}>
                {p}
              </button>
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
            <button type="submit" disabled={!input.trim() || isLoading}>
              +
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactPage;