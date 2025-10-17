import React from 'react';
import Modal from 'react-modal';
import { FaTimes } from 'react-icons/fa';
import './AboutModal.css';

Modal.setAppElement('#root');

const AboutModal = ({ isOpen, onRequestClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="About Me"
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <div className="modal-header">
        <h2>About Me</h2>
        <button onClick={onRequestClose} className="close-button">
          <FaTimes />
        </button>
      </div>
      <div className="modal-body">
        <p>
          Hi, I'm Viditi Vartak, an AI Engineer and Full-Stack Developer with a passion for building intelligent and user-friendly applications.
        </p>
        <p>
          My journey in tech has been driven by a curiosity for how things work and a desire to create solutions that make a difference. I specialize in leveraging large language models (LLMs) like Claude and GPT to build powerful AI-driven features, and I'm equally comfortable architecting robust backends with Python (FastAPI, Django) and crafting beautiful, responsive frontends with React and modern JavaScript.
        </p>
        <p>
          This portfolio is a demonstration of my skills—a chat interface powered by the Claude API on the backend and a sleek React UI on the frontend. Feel free to ask my AI assistant anything about my work!
        </p>
      </div>
    </Modal>
  );
};

export default AboutModal;
