import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';
import './ResumePage.css';

const ResumePage = ({
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

  const initialPrompts = [
    "Tell me about your Vue dashboard at Saayam",
    "What did you build at DentalScan?",
    "Describe your LendAPI React builder",
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

  return (
    <motion.div
      className="resume-page-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="resume-page-scroll-container">
        <div className="resume-header">
          <h1>Resume</h1>
          <a href="/Viditi-Vartak-Resume.pdf" target="_blank" rel="noopener noreferrer" className="download-btn">Download PDF</a>
          <button onClick={onClose} className="resume-page-close-btn">×</button>
        </div>

        <div className="resume-section">
          <h3>Professional Summary</h3>
          <p>
            Software engineer who builds product experiences people actually use. Experience spans Saayam For All
            (Vue donor dashboards), DentalScan (React/TypeScript clinic tools), LendAPI (React loan application builder),
            BusinessLab (React insurance ops UIs), and Nibodh (mobile React for 5,000+ users).
          </p>
        </div>

        <div className="resume-section">
          <h3>Work Experience</h3>
          <div className="experience-item">
            <h4>Full Stack Developer, Saayam For All</h4>
            <span>Oct 2025 – Present</span>
            <ul>
              <li>Rebuilt the donor-facing Vue.js dashboard for real-time donations, recurring gifts, and financial reporting.</li>
              <li>Built a reusable Vue.js component library (tables, multi-step forms, charts) that sped up feature delivery.</li>
            </ul>
          </div>
          <div className="experience-item">
            <h4>Software Engineer Intern, DentalScan</h4>
            <span>Aug 2025 – Oct 2025</span>
            <ul>
              <li>Built React/TypeScript patient dashboards with live appointment tracking and Twilio/Retell AI follow-ups.</li>
              <li>Added WebSocket sync so clinic dashboards stayed live without page refreshes.</li>
            </ul>
          </div>
          <div className="experience-item">
            <h4>Software Engineer Intern, LendAPI</h4>
            <span>Jun 2025 – Aug 2025</span>
            <ul>
              <li>Built a drag-and-drop React loan application builder for non-technical lending workflow configuration.</li>
              <li>Shipped dynamic forms and application management UI that streamlined lender onboarding.</li>
            </ul>
          </div>
          <div className="experience-item">
            <h4>Software Engineer, BusinessLab</h4>
            <span>Aug 2022 – Jul 2023</span>
            <ul>
              <li>Developed React insurance dashboards for policy lifecycle, underwriting, and operational reporting.</li>
              <li>Architected reusable component libraries and REST integrations that reduced time-to-feature.</li>
            </ul>
          </div>
        </div>

        <div className="resume-section">
          <h3>Projects</h3>
          <div className="project-item">
            <h4>AI Portfolio Chatbot</h4>
            <p>RAG chatbot (React, FastAPI, LangChain, ChromaDB, Tailwind) that answers portfolio questions with vector search and a polished chat UI.</p>
          </div>
          <div className="project-item">
            <h4>Emma – AI Therapist</h4>
            <p>Real-time voice therapy app in Next.js/TypeScript using Gemini Live and WebSockets, with Prisma/PostgreSQL session history on Vercel.</p>
          </div>
        </div>

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
              placeholder="Ask me anything about my resume..."
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

export default ResumePage;
