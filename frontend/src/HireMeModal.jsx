import React from 'react';
import Modal from 'react-modal';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';
import './HireMeModal.css';

Modal.setAppElement('#root');

const HireMeModal = ({ isOpen, onRequestClose }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here (e.g., send an email)
    alert("Thank you for your message! I'll get back to you shortly.");
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Hire Me"
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <div className="modal-header">
        <h2>Contact Me</h2>
        <button onClick={onRequestClose} className="close-button">
          <FaTimes />
        </button>
      </div>
      <div className="modal-body">
        <p>
          I'm currently available for new opportunities. Let's build something amazing together.
        </p>
        <form onSubmit={handleSubmit} className="contact-form">
          <input type="text" name="name" placeholder="Your Name" required />
          <input type="email" name="email" placeholder="Your Email" required />
          <textarea name="message" placeholder="Your Message" rows="4" required></textarea>
          <button type="submit" className="submit-btn">
            Send Message <FaPaperPlane />
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default HireMeModal;
