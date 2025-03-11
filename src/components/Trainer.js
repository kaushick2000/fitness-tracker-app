/* Last Name, First Name - Student ID */
/* 
 Suresh, Kaushick ( 1002237680 ), 
 Sivaprakash, Akshay Prassanna ( 1002198274 ) ,  
 Sonwane, Pratik ( 1002170610 ) , 
 Shaik, Arfan ( 1002260039 ) , 
 Sheth, Jeet ( 1002175315 ) 
*/
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/trainer.css';
import Nav from '../components/Nav';
import TrainerPic from '../assets/trainer.jpg';

const Trainer = () => {
  const navigate = useNavigate();
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  // Get purchased plans from localStorage
  const purchasedPlans = JSON.parse(localStorage.getItem('purchasedPlans') || '[]');
  
  // Redirect if no plans are purchased
  if (purchasedPlans.length === 0) {
    navigate('/plans');
    return null;
  }

  // Sample trainer data
  const trainers = [
    {
      id: 1,
      name: "Sarah Johnson",
      image: "/api/placeholder/150/150",
      email: "sarah.johnson@fitnesstracker.com",
      experience: 8,
      specialties: ["Strength Training", "Weight Loss", "HIIT"],
      availability: ["Mon-Wed: 9AM-5PM", "Fri: 10AM-6PM"],
      bio: "Sarah is a certified personal trainer with 8 years of experience helping clients achieve their fitness goals. She specializes in strength training and high-intensity interval training.",
      plan: "beginner"
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      image: "/api/placeholder/150/150",
      email: "michael.rodriguez@fitnesstracker.com",
      experience: 12,
      specialties: ["Bodybuilding", "Nutrition", "Sports Performance"],
      availability: ["Tue-Thu: 8AM-4PM", "Sat: 9AM-1PM"],
      bio: "Michael has been a fitness coach for over 12 years, working with both amateur and professional athletes. His approach combines proper nutrition with targeted training programs.",
      plan: "intermediate"
    },
    {
      id: 3,
      name: "Emma Chen",
      image: "/api/placeholder/150/150",
      email: "emma.chen@fitnesstracker.com",
      experience: 10,
      specialties: ["Yoga", "Functional Training", "Rehabilitation"],
      availability: ["Mon-Fri: 11AM-7PM"],
      bio: "Emma brings 10 years of experience in functional training and rehabilitation. She focuses on building strength and mobility through a holistic approach to fitness.",
      plan: "intermediate"
    },
    {
      id: 4,
      name: "David Williams",
      image: "/api/placeholder/150/150",
      email: "david.williams@fitnesstracker.com",
      experience: 15,
      specialties: ["Olympic Lifting", "Powerlifting", "Athletic Conditioning"],
      availability: ["Mon-Wed-Fri: 7AM-3PM", "Thu: 10AM-6PM"],
      bio: "With 15 years of experience training elite athletes, David specializes in strength development and athletic performance enhancement.",
      plan: "advanced"
    }
  ];

  // Filter trainers based on purchased plans
  const availableTrainers = trainers.filter(trainer => {
    // If advanced plan is purchased, all trainers are available
    if (purchasedPlans.includes('advanced')) return true;
    // If intermediate plan is purchased, show intermediate and beginner trainers
    if (purchasedPlans.includes('intermediate')) 
      return trainer.plan !== 'advanced';
    // If only beginner plan is purchased, show only beginner trainers
    return trainer.plan === 'beginner';
  });

  const handleTrainerSelect = (trainer) => {
    setSelectedTrainer(trainer);
    // Scroll to booking section
    document.getElementById('booking-section').scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const handleBookSession = (e) => {
    e.preventDefault();
    // Simulate booking process
    setTimeout(() => {
      setBookingSuccess(true);
      // Reset after 3 seconds
      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedTrainer(null);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="page-wrapper">
      <div className="nav-container">
        <Nav purchasedPlans={purchasedPlans} />
      </div>
      
      <div className="trainer-container">
        <div className="trainer-header">
          <h1>Personal Trainers</h1>
          <p>Connect with our expert trainers to get personalized guidance and support for your fitness journey.</p>
        </div>
        
        <div className="trainer-list">
          {availableTrainers.map(trainer => (
            <div key={trainer.id} className="trainer-card">
              <div className="trainer-image">
                <img src={TrainerPic} alt={trainer.name} />
              </div>
              <div className="trainer-info">
                <h2>{trainer.name}</h2>
                <p className="trainer-email">{trainer.email}</p>
                <p className="trainer-experience">{trainer.experience} years of experience</p>
                
                <div className="trainer-specialties">
                  <h3>Specialties:</h3>
                  <div className="specialty-tags">
                    {trainer.specialties.map((specialty, index) => (
                      <span key={index} className="specialty-tag">{specialty}</span>
                    ))}
                  </div>
                </div>
                
                <div className="trainer-availability">
                  <h3>Availability:</h3>
                  <ul>
                    {trainer.availability.map((time, index) => (
                      <li key={index}>{time}</li>
                    ))}
                  </ul>
                </div>
                
                <p className="trainer-bio">{trainer.bio}</p>
                
                <button 
                  className="trainer-select-btn"
                  onClick={() => handleTrainerSelect(trainer)}
                >
                  Book Session
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div id="booking-section" className="booking-section">
          {selectedTrainer && !bookingSuccess ? (
            <div className="booking-form-container">
              <h2>Book a Session with {selectedTrainer.name}</h2>
              <form className="booking-form" onSubmit={handleBookSession}>
                <div className="form-group">
                  <label htmlFor="session-date">Select Date</label>
                  <input type="date" id="session-date" required />
                </div>
                
                <div className="form-group">
                  <label htmlFor="session-time">Select Time</label>
                  <select id="session-time" required>
                    <option value="">-- Select Time --</option>
                    <option value="9:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="17:00">5:00 PM</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="session-type">Session Type</label>
                  <select id="session-type" required>
                    <option value="">-- Select Type --</option>
                    <option value="initial">Initial Consultation</option>
                    <option value="followup">Follow-up Session</option>
                    <option value="assessment">Fitness Assessment</option>
                    <option value="specialized">Specialized Training</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="session-notes">Additional Notes</label>
                  <textarea 
                    id="session-notes" 
                    placeholder="Any specific goals or concerns you'd like to discuss?"
                    rows="4"
                  ></textarea>
                </div>
                
                <button type="submit" className="booking-submit-btn">
                  Confirm Booking
                </button>
              </form>
            </div>
          ) : bookingSuccess ? (
            <div className="booking-success">
              <div className="success-icon">✓</div>
              <h2>Booking Successful!</h2>
              <p>Your session with {selectedTrainer.name} has been scheduled.</p>
              <p>You will receive a confirmation email shortly with additional details.</p>
            </div>
          ) : (
            <div className="select-trainer-message">
              <h2>Ready to work with a trainer?</h2>
              <p>Select a trainer above to schedule your session.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trainer;