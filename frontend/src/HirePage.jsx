import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';
import './HirePage.css';
import { askUrl } from './api.js';

const HirePage = ({
  onClose,
  messages: messagesProp,
  setMessages: setMessagesProp,
  input: inputProp,
  setInput: setInputProp,
  isLoading: isLoadingProp,
  setIsLoading: setIsLoadingProp,
  sendMessage: sendMessageProp,
}) => {
  // Local fallbacks if shared state isn't provided
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
      const response = await axios.post(askUrl(), { question: messageText });
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

  const initialPrompts = ["How can I contact you?", "Tell me about a recent project", "What's your tech stack?"];

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
              <p className="profile-title">Software Engineer</p>
            </div>
            <div className="status-badge">Open to opportunities</div>
          </div>
          <div className="details-grid">
            <div><span>Duration</span>Full-time - Immediate</div>
            <div><span>Location</span>San Jose, CA, Open to relocation</div>
          </div>
          <div className="detail-section">
            <h3><span role="img" aria-label="code">💻</span> Tech Stack</h3>
            <div className="tech-stack-grid">
              <ul><li>React.js</li><li>Vue.js</li><li>Next.js</li><li>TypeScript</li></ul>
              <ul><li>JavaScript</li><li>Tailwind CSS</li><li>WebSockets</li><li>HTML/CSS</li></ul>
              <ul><li>FastAPI</li><li>Node.js</li><li>PostgreSQL</li><li>AWS</li></ul>
            </div>
          </div>
          <div className="detail-section">
            <h3><span role="img" aria-label="checkmark">✔️</span> What I Bring</h3>
            <ul className="value-list">
              <li>Product UI in React, Vue, and Next.js — dashboards, forms, and design systems</li>
              <li>End-to-end delivery with strong API collaboration and reliable UX under load</li>
              <li>Reusable components and TypeScript-first architecture for faster shipping</li>
              <li>Real-time interfaces, accessible responsive design, and clear design-to-code handoff</li>
            </ul>
          </div>
          <div className="modal-actions">
            <a href="mailto:viditivartak08@gmail.com" className="action-btn primary">Contact Me</a>
            <a href="/Viditi-Vartak-Resume.pdf" target="_blank" rel="noopener noreferrer" className="action-btn secondary">View Resume</a>
          </div>
        </div>

        {/* Messages list */}
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