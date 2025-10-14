import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './ContactModal.css'; // We will create this CSS file next

const ContactModal = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

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
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting to the AI.", sender: 'ai' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  // The suggestions for the bottom chat interface
  const chatSuggestions = [
    "Tell me about your projects",
    "What technologies do you work with?",
    "Are you open to opportunities?"
  ];

  return (
    <motion.div
      className="contact-page-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top right close button */}
      <button onClick={onClose} className="contact-page-close-btn">×</button>

      {/* "How can I contact you?" chat bubble */}
      <div className="contact-query-bubble">How can I contact you?</div>

      {/* Main contact card content */}
      <div className="contact-card-container">
        <div className="contact-card-header">
          <img src="/avatar.png" alt="Aniket Thakker" />
          <div>
            <h2>Get in touch</h2>
            <p>Aniket Thakker</p>
          </div>
          <span className="responsive-badge">Responsive</span>
        </div>
        <div className="contact-details-grid">
          <div className="contact-card-item">
            <span>📧</span>
            <div>
              <strong>Email</strong>
              <a href="mailto:thakkeraniket@gmail.com">thakkeraniket@gmail.com</a>
            </div>
          </div>
          <div className="contact-card-item">
            <span>📞</span>
            <div>
              <strong>Phone</strong>
              <a href="tel:+19255195718">(925) 519-5718</a>
            </div>
          </div>
          <div className="contact-card-item">
            <span>📍</span>
            <div>
              <strong>Location</strong>
              <p>San Francisco, California</p>
            </div>
          </div>
          <div className="contact-card-item">
            <span>🔗</span>
            <div>
              <strong>LinkedIn</strong>
              <a href="https://linkedin.com/in/aniketthakker" target="_blank" rel="noopener noreferrer">linkedin.com/in/aniketthakker</a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom chat interface */}
      <div className="bottom-chat-interface">
        {/* Chat message history is hidden as per the image */}
        <div className="chat-messages-container" style={{display: 'none'}}>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              className={`chat-message-bubble ${msg.sender}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </motion.div>
          ))}
          {isLoading && <div className="chat-message-bubble ai typing-indicator"><span/><span/><span/></div>}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="chat-input-area">
          <div className="chat-suggestions">
            {chatSuggestions.map((p) => (
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
              placeholder="What else would you like to know about me?"
              disabled={isLoading}
            />
            <button type="submit" disabled={!input.trim() || isLoading}>
              <span className="material-icons">add</span>
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactModal;