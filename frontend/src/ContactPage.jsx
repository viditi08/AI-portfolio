import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';
import './ContactPage.css';

const ContactPage = ({
  onClose,
  messages: messagesProp,
  setMessages: setMessagesProp,
  input: inputProp,
  setInput: setInputProp,
  isLoading: isLoadingProp,
  setIsLoading: setIsLoadingProp,
  sendMessage: sendMessageProp,
}) => {
  const [localMessages, setLocalMessages] = useState([]);
  const [localInput, setLocalInput] = useState('');
  const [localIsLoading, setLocalIsLoading] = useState(false);

  const messages = messagesProp ?? localMessages;
  const setMessages = setMessagesProp ?? setLocalMessages;
  const input = inputProp ?? localInput;
  const setInput = setInputProp ?? setLocalInput;
  const isLoading = isLoadingProp ?? localIsLoading;
  const setIsLoading = setIsLoadingProp ?? setLocalIsLoading;

  const internalSendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return;
    setMessages(prev => [...prev, { text: messageText, sender: 'user' }]);
    setInput('');
    setIsLoading(true);
    try {
      const response = await axios.post('/ask', { question: messageText });
      setMessages(prev => [...prev, { text: response.data.answer, sender: 'ai' }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting.", sender: 'ai' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = sendMessageProp ?? internalSendMessage;

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const initialPrompts = ["Tell me about your projects", "What technologies do you work with?", "Are you open to opportunities?"];

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
        {/* Contact info card (remains separate) */}
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

        {/* Messages list BELOW the card */}
        <div className="chat-messages-container">
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
              →
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactPage;