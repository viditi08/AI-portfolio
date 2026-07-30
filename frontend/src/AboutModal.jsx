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
          Hi, I'm Viditi Vartak — a software engineer who builds products people enjoy using.
        </p>
        <p>
          I design interfaces that users actually want to use—bridging the gap between beautiful design and functional code. At Nibodh, I built React-based mobile UIs serving 5,000+ users, learning firsthand how design choices drive engagement. I combine that user-first mindset with scalable backend systems to create seamless, end-to-end experiences.
        </p>
        <p>
          Ask my portfolio assistant anything about my work, projects, or experience.
        </p>
      </div>
    </Modal>
  );
};

export default AboutModal;
