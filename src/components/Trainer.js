/* Last Name, First Name - Student ID */
/* 
 Suresh, Kaushick ( 1002237680 ), 
 Sivaprakash, Akshay Prassanna ( 1002198274 ) ,  
 Sonwane, Pratik ( 1002170610 ) , 
 Shaik, Arfan ( 1002260039 ) , 
 Sheth, Jeet ( 1002175315 ) 
*/

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import '../styles/trainer.css';
import Nav from '../components/Nav';
import TrainerPic1 from '../assets/trainer1.jpg';

const Trainer = () => {
  const navigate = useNavigate();
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    sessionType: '',
    notes: ''
  });
  
  // Get user ID and purchased plans from localStorage
  const userId = JSON.parse(localStorage.getItem('userId') || '0');
  const purchasedPlans = JSON.parse(localStorage.getItem('purchasedPlans') || '[]');
  
  // Fetch user profile from localStorage instead of API
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (userId) {
        try {
          // Check if user data exists in localStorage
          const userData = JSON.parse(localStorage.getItem('userData') || null);
          
          if (userData) {
            setUserProfile(userData);
          } else {
            // Fallback to API if not in localStorage
            const response = await fetch(`http://localhost:3000/api/users/${userId}`);
            if (response.ok) {
              const data = await response.json();
              setUserProfile(data.user);
              // Store in localStorage for future use
              localStorage.setItem('userData', JSON.stringify(data.user));
            }
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      }
    };
    
    fetchUserProfile();
  }, [userId]);
  
  // Redirect if no plans are purchased
  useEffect(() => {
    if (purchasedPlans.length === 0) {
      navigate('/plans');
    }
  }, [purchasedPlans, navigate]);

  // Sample trainer data
  const trainers = [
    {
      id: 1,
      name: "Sarah Johnson",
      image: '../assets/trainer1.jpg',
      email: "sarah.johnson@fitnesstracker.com",
      experience: 8,
      specialties: ["Strength Training", "Weight Loss", "HIIT"],
      availability: ["Mon-Wed: 9AM-5PM", "Fri: 10AM-6PM"],
      bio: "Sarah is a certified personal trainer with 8 years of experience helping clients achieve their fitness goals. She specializes in strength training and high-intensity interval training.",
      plan: "beginner"
    },
    // {
    //   id: 2,
    //   name: "Michael Rodriguez",
    //   image: "/api/placeholder/150/150",
    //   email: "michael.rodriguez@fitnesstracker.com",
    //   experience: 12,
    //   specialties: ["Bodybuilding", "Nutrition", "Sports Performance"],
    //   availability: ["Tue-Thu: 8AM-4PM", "Sat: 9AM-1PM"],
    //   bio: "Michael has been a fitness coach for over 12 years, working with both amateur and professional athletes. His approach combines proper nutrition with targeted training programs.",
    //   plan: "intermediate"
    //  }
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

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [id.replace('session-', '')]: value
    }));
  };

  const formatSessionType = (type) => {
    switch(type) {
      case 'initial': return 'Initial Consultation';
      case 'followup': return 'Follow-up Session';
      case 'assessment': return 'Fitness Assessment';
      case 'specialized': return 'Specialized Training';
      default: return type;
    }
  };

  const handleBookSession = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (!userProfile || !userProfile.email) {
        throw new Error('User profile not found. Please try again later.');
      }
      
      // Define EmailJS template parameters
      const templateParams = {
        to_name: userProfile.name || userProfile.email.split('@')[0],
        to_email: userProfile.email,
        user_name: userProfile.name || 'Valued Customer',
        trainer_name: selectedTrainer.name,
        trainer_email: selectedTrainer.email,
        session_date: bookingData.date,
        session_time: bookingData.time,
        session_type: formatSessionType(bookingData.sessionType),
        notes: bookingData.notes || 'No additional notes',
        plan_type: purchasedPlans[0] // Use the first purchased plan
      };
      
      // Send email using EmailJS
      await emailjs.send(
        'service_t0ikfke', 
        'template_bbe329p', 
        templateParams,
        'ANY0bxTRDfxlzfn8s'
      );
      
      // Prepare booking payload
      const bookingPayload = {
        user_id: userId,
        trainer_id: selectedTrainer.id,
        date: bookingData.date,
        time: bookingData.time,
        session_type: bookingData.sessionType,
        notes: bookingData.notes || ''
      };
      
      console.log('Attempting to send booking data:', bookingPayload);
      
      // Actually send the data to the API now
      const response = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingPayload),
      });
      
      // Check if response is OK and log the response
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || 'Failed to book session');
        } catch (jsonError) {
          throw new Error(`Failed to book session: ${response.status} ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      console.log('Booking successful:', data);
      
      // Show success message
      setBookingSuccess(true);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedTrainer(null);
        setBookingData({
          date: '',
          time: '',
          sessionType: '',
          notes: ''
        });
      }, 3000);
      
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.message || 'An error occurred while booking your session');
    } finally {
      setLoading(false);
    }
  };

  // If redirecting, don't render the component
  if (purchasedPlans.length === 0) {
    return null;
  }

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
                <img src={TrainerPic1} alt={trainer.name} />
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
                
                {/* <div className="trainer-availability">
                  <h3>Availability:</h3>
                  <ul>
                    {trainer.availability.map((time, index) => (
                      <li key={index}>{time}</li>
                    ))}
                  </ul>
                </div> */}
                
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
              
              {error && <div className="error-message">{error}</div>}
              
              <form className="booking-form" onSubmit={handleBookSession}>
                <div className="form-group">
                  <label htmlFor="session-date">Select Date</label>
                  <input 
                    type="date" 
                    id="session-date" 
                    value={bookingData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]} // Set minimum date to today
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="session-time">Select Time</label>
                  <select 
                    id="session-time" 
                    value={bookingData.time}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">-- Select Time --</option>
                    <option value="9:00 AM">9:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="1:00 PM">1:00 PM</option>
                    <option value="2:00 PM">2:00 PM</option>
                    <option value="3:00 PM">3:00 PM</option>
                    <option value="4:00 PM">4:00 PM</option>
                    <option value="5:00 PM">5:00 PM</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="session-sessionType">Session Type</label>
                  <select 
                    id="session-sessionType" 
                    value={bookingData.sessionType}
                    onChange={handleInputChange}
                    required
                  >
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
                    value={bookingData.notes}
                    onChange={handleInputChange}
                    placeholder="Any specific goals or concerns you'd like to discuss?"
                    rows="4"
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className="booking-submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Confirm Booking'}
                </button>
              </form>
            </div>
          ) : bookingSuccess ? (
            <div className="booking-success">
              <div className="success-icon">✓</div>
              <h2>Booking Successful!</h2>
              <p>Your session with {selectedTrainer.name} has been scheduled.</p>
              <p>A confirmation email has been sent to your registered email address.</p>
            </div>
          ) : (
            <div className="booking-placeholder">
              <h3>Select a trainer above to book a session</h3>
              <p>Choose from our expert trainers based on your fitness goals and preferences.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trainer;
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import emailjs from '@emailjs/browser';
// import '../styles/trainer.css';
// import Nav from '../components/Nav';
// import TrainerPic from '../assets/trainer.jpg';

// const Trainer = () => {
//   const navigate = useNavigate();
//   const [selectedTrainer, setSelectedTrainer] = useState(null);
//   const [bookingSuccess, setBookingSuccess] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [userProfile, setUserProfile] = useState(null);
//   const [bookingData, setBookingData] = useState({
//     date: '',
//     time: '',
//     sessionType: '',
//     notes: ''
//   });
  
//   // Get user ID and purchased plans from localStorage
//   const userId = JSON.parse(localStorage.getItem('userId') || '0');
//   const purchasedPlans = JSON.parse(localStorage.getItem('purchasedPlans') || '[]');
  
//   // Fetch user profile for email data
//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       if (userId) {
//         try {
//           const response = await fetch(`http://localhost:3000/api/users/${userId}`);
//           if (response.ok) {
//             const data = await response.json();
//             setUserProfile(data.user);
//           }
//         } catch (err) {
//           console.error('Error fetching user profile:', err);
//         }
//       }
//     };
    
//     fetchUserProfile();
//   }, [userId]);
  
//   // Redirect if no plans are purchased
//   useEffect(() => {
//     if (purchasedPlans.length === 0) {
//       navigate('/plans');
//     }
//   }, [purchasedPlans, navigate]);

//   // Sample trainer data
//   const trainers = [
//     {
//       id: 1,
//       name: "Sarah Johnson",
//       image: "/api/placeholder/150/150",
//       email: "sarah.johnson@fitnesstracker.com",
//       experience: 8,
//       specialties: ["Strength Training", "Weight Loss", "HIIT"],
//       availability: ["Mon-Wed: 9AM-5PM", "Fri: 10AM-6PM"],
//       bio: "Sarah is a certified personal trainer with 8 years of experience helping clients achieve their fitness goals. She specializes in strength training and high-intensity interval training.",
//       plan: "beginner"
//     },
//     // {
//     //   id: 2,
//     //   name: "Michael Rodriguez",
//     //   image: "/api/placeholder/150/150",
//     //   email: "michael.rodriguez@fitnesstracker.com",
//     //   experience: 12,
//     //   specialties: ["Bodybuilding", "Nutrition", "Sports Performance"],
//     //   availability: ["Tue-Thu: 8AM-4PM", "Sat: 9AM-1PM"],
//     //   bio: "Michael has been a fitness coach for over 12 years, working with both amateur and professional athletes. His approach combines proper nutrition with targeted training programs.",
//     //   plan: "intermediate"
//     // },
//     // {
//     //   id: 3,
//     //   name: "Emma Chen",
//     //   image: "/api/placeholder/150/150",
//     //   email: "emma.chen@fitnesstracker.com",
//     //   experience: 10,
//     //   specialties: ["Yoga", "Functional Training", "Rehabilitation"],
//     //   availability: ["Mon-Fri: 11AM-7PM"],
//     //   bio: "Emma brings 10 years of experience in functional training and rehabilitation. She focuses on building strength and mobility through a holistic approach to fitness.",
//     //   plan: "intermediate"
//     // },
//     // {
//     //   id: 4,
//     //   name: "David Williams",
//     //   image: "/api/placeholder/150/150",
//     //   email: "david.williams@fitnesstracker.com",
//     //   experience: 15,
//     //   specialties: ["Olympic Lifting", "Powerlifting", "Athletic Conditioning"],
//     //   availability: ["Mon-Wed-Fri: 7AM-3PM", "Thu: 10AM-6PM"],
//     //   bio: "With 15 years of experience training elite athletes, David specializes in strength development and athletic performance enhancement.",
//     //   plan: "advanced"
//     // }
//   ];

//   // Filter trainers based on purchased plans
//   const availableTrainers = trainers.filter(trainer => {
//     // If advanced plan is purchased, all trainers are available
//     if (purchasedPlans.includes('advanced')) return true;
//     // If intermediate plan is purchased, show intermediate and beginner trainers
//     if (purchasedPlans.includes('intermediate')) 
//       return trainer.plan !== 'advanced';
//     // If only beginner plan is purchased, show only beginner trainers
//     return trainer.plan === 'beginner';
//   });

//   const handleTrainerSelect = (trainer) => {
//     setSelectedTrainer(trainer);
//     // Scroll to booking section
//     document.getElementById('booking-section').scrollIntoView({ 
//       behavior: 'smooth',
//       block: 'start'
//     });
//   };

//   const handleInputChange = (e) => {
//     const { id, value } = e.target;
//     setBookingData(prev => ({
//       ...prev,
//       [id.replace('session-', '')]: value
//     }));
//   };

//   const formatSessionType = (type) => {
//     switch(type) {
//       case 'initial': return 'Initial Consultation';
//       case 'followup': return 'Follow-up Session';
//       case 'assessment': return 'Fitness Assessment';
//       case 'specialized': return 'Specialized Training';
//       default: return type;
//     }
//   };

//   const handleBookSession = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);
    
//     try {
//       if (!userProfile || !userProfile.email) {
//         throw new Error('User profile not found. Please try again later.');
//       }
      
//       // Define EmailJS template parameters
//       const templateParams = {
//         to_name: userProfile.name || userProfile.email.split('@')[0],
//         to_email: userProfile.email,
//         user_name: userProfile.name || 'Valued Customer',
//         trainer_name: selectedTrainer.name,
//         trainer_email: selectedTrainer.email,
//         session_date: bookingData.date,
//         session_time: bookingData.time,
//         session_type: formatSessionType(bookingData.sessionType),
//         notes: bookingData.notes || 'No additional notes',
//         plan_type: purchasedPlans[0] // Use the first purchased plan
//       };
      
//       // Send email using EmailJS
//       await emailjs.send(
//         'service_t0ikfke', // Replace with your EmailJS service ID
//         'template_bbe329p', // Replace with your EmailJS template ID
//         templateParams,
//         'ANY0bxTRDfxlzfn8s' // Replace with your EmailJS public key
//       );
      
//       // Save booking to database
//       const bookingPayload = {
//         user_id: userId,
//         trainer_id: selectedTrainer.id,
//         date: bookingData.date,
//         time: bookingData.time,
//         session_type: bookingData.sessionType,
//         notes: bookingData.notes
//       };
      
//       const response = await fetch('http://localhost:3000/api/bookings', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(bookingPayload),
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to book session');
//       }
      
//       // Show success message
//       setBookingSuccess(true);
      
//       // Reset after 3 seconds
//       setTimeout(() => {
//         setBookingSuccess(false);
//         setSelectedTrainer(null);
//         setBookingData({
//           date: '',
//           time: '',
//           sessionType: '',
//           notes: ''
//         });
//       }, 3000);
      
//     } catch (err) {
//       console.error('Booking error:', err);
//       setError(err.message || 'An error occurred while booking your session');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // If redirecting, don't render the component
//   if (purchasedPlans.length === 0) {
//     return null;
//   }

//   return (
//     <div className="page-wrapper">
//       <div className="nav-container">
//         <Nav purchasedPlans={purchasedPlans} />
//       </div>
      
//       <div className="trainer-container">
//         <div className="trainer-header">
//           <h1>Personal Trainers</h1>
//           <p>Connect with our expert trainers to get personalized guidance and support for your fitness journey.</p>
//         </div>
        
//         <div className="trainer-list">
//           {availableTrainers.map(trainer => (
//             <div key={trainer.id} className="trainer-card">
//               <div className="trainer-image">
//                 <img src={TrainerPic} alt={trainer.name} />
//               </div>
//               <div className="trainer-info">
//                 <h2>{trainer.name}</h2>
//                 <p className="trainer-email">{trainer.email}</p>
//                 <p className="trainer-experience">{trainer.experience} years of experience</p>
                
//                 <div className="trainer-specialties">
//                   <h3>Specialties:</h3>
//                   <div className="specialty-tags">
//                     {trainer.specialties.map((specialty, index) => (
//                       <span key={index} className="specialty-tag">{specialty}</span>
//                     ))}
//                   </div>
//                 </div>
                
//                 <div className="trainer-availability">
//                   <h3>Availability:</h3>
//                   <ul>
//                     {trainer.availability.map((time, index) => (
//                       <li key={index}>{time}</li>
//                     ))}
//                   </ul>
//                 </div>
                
//                 <p className="trainer-bio">{trainer.bio}</p>
                
//                 <button 
//                   className="trainer-select-btn"
//                   onClick={() => handleTrainerSelect(trainer)}
//                 >
//                   Book Session
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
        
//         <div id="booking-section" className="booking-section">
//           {selectedTrainer && !bookingSuccess ? (
//             <div className="booking-form-container">
//               <h2>Book a Session with {selectedTrainer.name}</h2>
              
//               {error && <div className="error-message">{error}</div>}
              
//               <form className="booking-form" onSubmit={handleBookSession}>
//                 <div className="form-group">
//                   <label htmlFor="session-date">Select Date</label>
//                   <input 
//                     type="date" 
//                     id="session-date" 
//                     value={bookingData.date}
//                     onChange={handleInputChange}
//                     min={new Date().toISOString().split('T')[0]} // Set minimum date to today
//                     required 
//                   />
//                 </div>
                
//                 <div className="form-group">
//                   <label htmlFor="session-time">Select Time</label>
//                   <select 
//                     id="session-time" 
//                     value={bookingData.time}
//                     onChange={handleInputChange}
//                     required
//                   >
//                     <option value="">-- Select Time --</option>
//                     <option value="9:00 AM">9:00 AM</option>
//                     <option value="10:00 AM">10:00 AM</option>
//                     <option value="11:00 AM">11:00 AM</option>
//                     <option value="12:00 PM">12:00 PM</option>
//                     <option value="1:00 PM">1:00 PM</option>
//                     <option value="2:00 PM">2:00 PM</option>
//                     <option value="3:00 PM">3:00 PM</option>
//                     <option value="4:00 PM">4:00 PM</option>
//                     <option value="5:00 PM">5:00 PM</option>
//                   </select>
//                 </div>
                
//                 <div className="form-group">
//                   <label htmlFor="session-sessionType">Session Type</label>
//                   <select 
//                     id="session-sessionType" 
//                     value={bookingData.sessionType}
//                     onChange={handleInputChange}
//                     required
//                   >
//                     <option value="">-- Select Type --</option>
//                     <option value="initial">Initial Consultation</option>
//                     <option value="followup">Follow-up Session</option>
//                     <option value="assessment">Fitness Assessment</option>
//                     <option value="specialized">Specialized Training</option>
//                   </select>
//                 </div>
                
//                 <div className="form-group">
//                   <label htmlFor="session-notes">Additional Notes</label>
//                   <textarea 
//                     id="session-notes" 
//                     value={bookingData.notes}
//                     onChange={handleInputChange}
//                     placeholder="Any specific goals or concerns you'd like to discuss?"
//                     rows="4"
//                   ></textarea>
//                 </div>
                
//                 <button 
//                   type="submit" 
//                   className="booking-submit-btn"
//                   disabled={loading}
//                 >
//                   {loading ? 'Processing...' : 'Confirm Booking'}
//                 </button>
//               </form>
//             </div>
//           ) : bookingSuccess ? (
//             <div className="booking-success">
//               <div className="success-icon">✓</div>
//               <h2>Booking Successful!</h2>
//               <p>Your session with {selectedTrainer.name} has been scheduled.</p>
//               <p>A confirmation email has been sent to your registered email address.</p>
//             </div>
//           ) : (
//             <div className="booking-placeholder">
//               <h3>Select a trainer above to book a session</h3>
//               <p>Choose from our expert trainers based on your fitness goals and preferences.</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Trainer;
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import '../styles/trainer.css';
// import Nav from '../components/Nav';
// import TrainerPic from '../assets/trainer.jpg';

// const Trainer = () => {
//   const navigate = useNavigate();
//   const [selectedTrainer, setSelectedTrainer] = useState(null);
//   const [bookingSuccess, setBookingSuccess] = useState(false);
  
//   // Get purchased plans from localStorage
//   const purchasedPlans = JSON.parse(localStorage.getItem('purchasedPlans') || '[]');
  
//   // Redirect if no plans are purchased
//   if (purchasedPlans.length === 0) {
//     navigate('/plans');
//     return null;
//   }

//   // Sample trainer data
//   const trainers = [
//     {
//       id: 1,
//       name: "Sarah Johnson",
//       image: "/api/placeholder/150/150",
//       email: "sarah.johnson@fitnesstracker.com",
//       experience: 8,
//       specialties: ["Strength Training", "Weight Loss", "HIIT"],
//       availability: ["Mon-Wed: 9AM-5PM", "Fri: 10AM-6PM"],
//       bio: "Sarah is a certified personal trainer with 8 years of experience helping clients achieve their fitness goals. She specializes in strength training and high-intensity interval training.",
//       plan: "beginner"
//     },
//     {
//       id: 2,
//       name: "Michael Rodriguez",
//       image: "/api/placeholder/150/150",
//       email: "michael.rodriguez@fitnesstracker.com",
//       experience: 12,
//       specialties: ["Bodybuilding", "Nutrition", "Sports Performance"],
//       availability: ["Tue-Thu: 8AM-4PM", "Sat: 9AM-1PM"],
//       bio: "Michael has been a fitness coach for over 12 years, working with both amateur and professional athletes. His approach combines proper nutrition with targeted training programs.",
//       plan: "intermediate"
//     },
//     {
//       id: 3,
//       name: "Emma Chen",
//       image: "/api/placeholder/150/150",
//       email: "emma.chen@fitnesstracker.com",
//       experience: 10,
//       specialties: ["Yoga", "Functional Training", "Rehabilitation"],
//       availability: ["Mon-Fri: 11AM-7PM"],
//       bio: "Emma brings 10 years of experience in functional training and rehabilitation. She focuses on building strength and mobility through a holistic approach to fitness.",
//       plan: "intermediate"
//     },
//     {
//       id: 4,
//       name: "David Williams",
//       image: "/api/placeholder/150/150",
//       email: "david.williams@fitnesstracker.com",
//       experience: 15,
//       specialties: ["Olympic Lifting", "Powerlifting", "Athletic Conditioning"],
//       availability: ["Mon-Wed-Fri: 7AM-3PM", "Thu: 10AM-6PM"],
//       bio: "With 15 years of experience training elite athletes, David specializes in strength development and athletic performance enhancement.",
//       plan: "advanced"
//     }
//   ];

//   // Filter trainers based on purchased plans
//   const availableTrainers = trainers.filter(trainer => {
//     // If advanced plan is purchased, all trainers are available
//     if (purchasedPlans.includes('advanced')) return true;
//     // If intermediate plan is purchased, show intermediate and beginner trainers
//     if (purchasedPlans.includes('intermediate')) 
//       return trainer.plan !== 'advanced';
//     // If only beginner plan is purchased, show only beginner trainers
//     return trainer.plan === 'beginner';
//   });

//   const handleTrainerSelect = (trainer) => {
//     setSelectedTrainer(trainer);
//     // Scroll to booking section
//     document.getElementById('booking-section').scrollIntoView({ 
//       behavior: 'smooth',
//       block: 'start'
//     });
//   };

//   const handleBookSession = (e) => {
//     e.preventDefault();
//     // Simulate booking process
//     setTimeout(() => {
//       setBookingSuccess(true);
//       // Reset after 3 seconds
//       setTimeout(() => {
//         setBookingSuccess(false);
//         setSelectedTrainer(null);
//       }, 3000);
//     }, 1500);
//   };

//   return (
//     <div className="page-wrapper">
//       <div className="nav-container">
//         <Nav purchasedPlans={purchasedPlans} />
//       </div>
      
//       <div className="trainer-container">
//         <div className="trainer-header">
//           <h1>Personal Trainers</h1>
//           <p>Connect with our expert trainers to get personalized guidance and support for your fitness journey.</p>
//         </div>
        
//         <div className="trainer-list">
//           {availableTrainers.map(trainer => (
//             <div key={trainer.id} className="trainer-card">
//               <div className="trainer-image">
//                 <img src={TrainerPic} alt={trainer.name} />
//               </div>
//               <div className="trainer-info">
//                 <h2>{trainer.name}</h2>
//                 <p className="trainer-email">{trainer.email}</p>
//                 <p className="trainer-experience">{trainer.experience} years of experience</p>
                
//                 <div className="trainer-specialties">
//                   <h3>Specialties:</h3>
//                   <div className="specialty-tags">
//                     {trainer.specialties.map((specialty, index) => (
//                       <span key={index} className="specialty-tag">{specialty}</span>
//                     ))}
//                   </div>
//                 </div>
                
//                 <div className="trainer-availability">
//                   <h3>Availability:</h3>
//                   <ul>
//                     {trainer.availability.map((time, index) => (
//                       <li key={index}>{time}</li>
//                     ))}
//                   </ul>
//                 </div>
                
//                 <p className="trainer-bio">{trainer.bio}</p>
                
//                 <button 
//                   className="trainer-select-btn"
//                   onClick={() => handleTrainerSelect(trainer)}
//                 >
//                   Book Session
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
        
//         <div id="booking-section" className="booking-section">
//           {selectedTrainer && !bookingSuccess ? (
//             <div className="booking-form-container">
//               <h2>Book a Session with {selectedTrainer.name}</h2>
//               <form className="booking-form" onSubmit={handleBookSession}>
//                 <div className="form-group">
//                   <label htmlFor="session-date">Select Date</label>
//                   <input type="date" id="session-date" required />
//                 </div>
                
//                 <div className="form-group">
//                   <label htmlFor="session-time">Select Time</label>
//                   <select id="session-time" required>
//                     <option value="">-- Select Time --</option>
//                     <option value="9:00">9:00 AM</option>
//                     <option value="10:00">10:00 AM</option>
//                     <option value="11:00">11:00 AM</option>
//                     <option value="12:00">12:00 PM</option>
//                     <option value="13:00">1:00 PM</option>
//                     <option value="14:00">2:00 PM</option>
//                     <option value="15:00">3:00 PM</option>
//                     <option value="16:00">4:00 PM</option>
//                     <option value="17:00">5:00 PM</option>
//                   </select>
//                 </div>
                
//                 <div className="form-group">
//                   <label htmlFor="session-type">Session Type</label>
//                   <select id="session-type" required>
//                     <option value="">-- Select Type --</option>
//                     <option value="initial">Initial Consultation</option>
//                     <option value="followup">Follow-up Session</option>
//                     <option value="assessment">Fitness Assessment</option>
//                     <option value="specialized">Specialized Training</option>
//                   </select>
//                 </div>
                
//                 <div className="form-group">
//                   <label htmlFor="session-notes">Additional Notes</label>
//                   <textarea 
//                     id="session-notes" 
//                     placeholder="Any specific goals or concerns you'd like to discuss?"
//                     rows="4"
//                   ></textarea>
//                 </div>
                
//                 <button type="submit" className="booking-submit-btn">
//                   Confirm Booking
//                 </button>
//               </form>
//             </div>
//           ) : bookingSuccess ? (
//             <div className="booking-success">
//               <div className="success-icon">✓</div>
//               <h2>Booking Successful!</h2>
//               <p>Your session with {selectedTrainer.name} has been scheduled.</p>
//               <p>You will receive a confirmation email shortly with additional details.</p>
//             </div>
//           ) : (
//             <div className="select-trainer-message">
//               <h2>Ready to work with a trainer?</h2>
//               <p>Select a trainer above to schedule your session.</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Trainer;