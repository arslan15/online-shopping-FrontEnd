import React, { useState } from 'react';
import axios from 'axios';
import { 
  FaEnvelope, 
  FaPhoneAlt, 
  FaMapMarkerAlt, 
  FaPaperPlane,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaSpinner,
  FaComments
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const baseUrl = process.env.REACT_APP_CONTACT_API_BASE_URL || '';
      const response = await axios.post(`${baseUrl}/contact`, formData);

      if (response.status === 200 || response.status === 201) {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        toast.success(response.data?.message || 'Message sent successfully!');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to send message.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        
        {/* Header / Intro */}
        <div className="contact-header">
          <span className="contact-badge">
            <FaComments /> Let's Connect
          </span>
          <h1 className="contact-title">Get In Touch</h1>
          <p className="contact-subtitle">
            Have a question, proposal, or project idea? Send us a message and we will respond as soon as possible.
          </p>
        </div>

        <div className="contact-grid">
          
          {/* Left Column: Contact Info Glass Cards */}
          <div className="contact-info-column">
            
            <div className="info-card-glass">
              <div className="info-icon-badge purple">
                <FaEnvelope />
              </div>
              <div className="info-details">
                <span className="info-label">Email Us</span>
                <a href="mailto:asarslansaeed1@gmail.com" className="info-value">
                  asarslansaeed1@gmail.com
                </a>
              </div>
            </div>

            <div className="info-card-glass">
              <div className="info-icon-badge green">
                <FaPhoneAlt />
              </div>
              <div className="info-details">
                <span className="info-label">Call Us</span>
                <a href="tel:+923329580707" className="info-value">
                  +92 332 9580707
                </a>
              </div>
            </div>

            <div className="info-card-glass">
              <div className="info-icon-badge yellow">
                <FaMapMarkerAlt />
              </div>
              <div className="info-details">
                <span className="info-label">Our Office</span>
                <p className="info-value margin-none">Islamabad, Pakistan</p>
              </div>
            </div>

            {/* Social Links & Feedback */}
            <div className="info-card-glass feedback-card">
              <span className="info-label mb-2">Connect & Feedback</span>
              <p className="feedback-text">
                Give us feedback so we can continuously improve our services and capabilities.
              </p>
              <div className="social-icons-wrapper">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn">
                  <FaGithub />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn">
                  <FaLinkedin />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn">
                  <FaTwitter />
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="contact-form-column">
            <div className="form-card-glass">
              <h3 className="form-title">Send a Message</h3>

              {submitted && (
                <div className="contact-alert-success">
                  <span>Thank you! Your message has been sent successfully.</span>
                  <button type="button" className="alert-close-btn" onClick={() => setSubmitted(false)}>
                    &times;
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row-2col">
                  <div className="form-field">
                    <label className="field-label">Your Name</label>
                    <input
                      type="text"
                      className="glass-input"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="field-label">Your Email</label>
                    <input
                      type="email"
                      className="glass-input"
                      name="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="field-label">Subject</label>
                  <input
                    type="text"
                    className="glass-input"
                    name="subject"
                    placeholder="How can we help you?"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Message</label>
                  <textarea
                    className="glass-input textarea"
                    name="message"
                    rows="5"
                    placeholder="Write your message here..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn-send-message" disabled={loading}>
                  {loading ? (
                    <>
                      <FaSpinner className="spinner-icon" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Contact;