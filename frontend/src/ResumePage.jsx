import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './ResumePage.css'; // We will create this CSS file next

const ResumePage = ({ onClose }) => {
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

  const initialPrompts = ["Tell me about your experience at LendAPI", "What is SkySpark?", "What are your certifications?"];

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
          <p>My journey in technology has been driven by a desire to build things that make a real impact. It began to take shape during my time as a Software Engineer at BussinessLab, where I dove deep into backend development and automation, leading me to pursue a Master's in Computer Science to understand the architecture of large-scale systems and AI.</p>
        </div>

        <div className="resume-section">
          <h3>Work Experience</h3>
          <div className="experience-item">
            <h4>Software Engineer Intern, LendAPI</h4>
            <span>Jun 2025 – Aug 2025</span>
            <ul>
              <li>Built a full-stack B2B loan application using Python, Django, and JavaScript, reducing processing time by 45%.</li>
              <li>Developed an intelligent customer service assistant with fine-tuned models, automating 60% of support queries.</li>
            </ul>
          </div>
          <div className="experience-item">
            <h4>Software Engineer, BussinessLab</h4>
            <span>Aug 2021 – Jul 2023</span>
            <ul>
              <li>Architected microservices using Java (Spring Boot), reducing risk identification time by 30%.</li>
              <li>Engineered a modular self-service platform with React and TypeScript, reducing engineering support requests by 60%.</li>
            </ul>
          </div>
        </div>

        <div className="resume-section">
          <h3>Projects</h3>
          <div className="project-item">
            <h4>SkySpark: Scalable Airline Performance Analysis</h4>
            <p>Engineered a cloud-native data pipeline with Kubernetes, Apache Spark, and Cassandra for airline performance analysis, improving data accessibility by 40%.</p>
          </div>
           <div className="project-item">
            <h4>Resume Job Matcher AI</h4>
            <p>Built an AI-powered platform using React.js, Flask, and Gemini via LangChain to analyze resumes and job descriptions, visualizing skill matches and suggesting improvements.</p>
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
              +
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default ResumePage;