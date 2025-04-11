import React, { useState, useEffect } from 'react';
import '../styles/contactus.css';
import Nav from './Nav';
import emailjs from '@emailjs/browser';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    name: '',
    email: '',
    phone: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [purchasedPlans, setPurchasedPlans] = useState(() => {
    const savedPlans = localStorage.getItem('purchasedPlans');
    return savedPlans ? JSON.parse(savedPlans) : [];
  });
  
  useEffect(() => {
    localStorage.setItem('purchasedPlans', JSON.stringify(purchasedPlans));
  }, [purchasedPlans]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Prepare template parameters manually to ensure all data is included
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      phone_number: formData.phone || 'Not provided',
      subject: formData.subject,
      message: formData.message,
      to_email: 'attendanceproject1411@gmail.com',
      reply_to: formData.email
    };

    // Send email with manually created template parameters
    emailjs.send(
      'service_t0ikfke',       // Your EmailJS service ID
      'template_egarc9t',      // Your EmailJS template ID
      templateParams,          // Template parameters
      'ANY0bxTRDfxlzfn8s'        // Your EmailJS public key
    )
    .then((result) => {
      console.log('Email sent successfully:', result.text);
      setSubmitted(true);
      // Reset form after submission
      setFormData({
        subject: '',
        message: '',
        name: '',
        email: '',
        phone: ''
      });
    })
    .catch((error) => {
      console.error('Failed to send email:', error);
      setError('Failed to send your message. Please try again later.');
    })
    .finally(() => {
      setLoading(false);
    });
  };

  // Map with the provided coordinates
  const renderMap = () => {
    const mapUrl = `https://maps.google.com/maps?q=${32.7310},${-97.1150}&z=14&output=embed`;
    return (
      <iframe 
        src={mapUrl} 
        width="100%" 
        height="300" 
        style={{ border: 0, borderRadius: '8px' }} 
        allowFullScreen="" 
        loading="lazy" 
        referrerPolicy="no-referrer-when-downgrade"
        title="Google Map"
      ></iframe>
    );
  };

  return (
    <div className="page-wrapper">
      <Nav purchasedPlans={purchasedPlans}/>
      <div className="contact-page">
        <h1>Contact Us</h1>
        
        <div className="contact-container">
          <div className="contact-form-section">
            <h2>Get in Touch</h2>
            
            {submitted ? (
              <div className="success-message">
                <h3>Thank you for your message!</h3>
                <p>We will get back to you as soon as possible.</p>
                <button onClick={() => setSubmitted(false)}>Send Another Message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Your Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    required
                  ></textarea>
                </div>
                
                {error && <div className="error-message">{error}</div>}
                
                <button 
                  type="submit" 
                  className="submit-btn" 
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
          
          {/* <div className="contact-info-section">
            <div className="contact-info">
              <h2>Contact Information</h2>
              <div className="info-item">
                <span className="icon">📧</span>
                <div>
                  <h3>Email</h3>
                  <p><a href="mailto:attendanceproject1411@gmail.com">attendanceproject1411@gmail.com</a></p>
                </div>
              </div>
              
              <div className="info-item">
                <span className="icon">📱</span>
                <div>
                  <h3>Phone</h3>
                  <p><a href="tel:+1234567890">(123) 456-7890</a></p>
                </div>
              </div>
              
              <div className="info-item">
                <span className="icon">🕒</span>
                <div>
                  <h3>Business Hours</h3>
                  <p>Monday - Friday: 9am - 5pm</p>
                  <p>Saturday & Sunday: Closed</p>
                </div>
              </div>
            </div>
             */}
            <div className="location-section">
              <h2>Conference Location</h2>
              <div className="map-container">
                {renderMap()}
              </div>
              <div className="address">
                <h3>Address</h3>
                <p>Conference Center</p>
                <p>123 Main Street</p>
                <p>Arlington, TX 76011</p>
                <p>United States</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    // </div>
  );
};

export default ContactUs;