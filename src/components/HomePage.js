import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import '../styles/homepage.css';
// Import images
import homepageImg1 from '../assets/homepageimg1.jpg';
import homepageImg2 from '../assets/homepageimg2.jpg';
import trackingVisualization from '../assets/trackingVisualization.jpg'; // Add this line for your new image

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  const handlePlanSelection = (plan) => {
    if (isLoggedIn) {
      navigate('/dashboard', { state: { selectedPlan: plan } });
    } else {
      navigate('/login');
    }
  };
  
  return (
    <div className="homepage-container">
      {/* Header */}
      <header className="homepage-header">
        <div className="logo">FitnessTracker</div>
        <div className="nav-buttons">
          {isLoggedIn ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="nav-button"
            >
              Dashboard
            </button>
          ) : (
            <>
              <button 
                onClick={() => navigate('/login')}
                className="nav-button login-btn"
              >
                Log In
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="nav-button signup-btn"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>
      
      {/* Hero Section with Fitness Photo */}
      <div className="hero-section" style={{ backgroundImage: `url(${homepageImg1})` }}>
        <div className="hero-overlay">
          <h1>Transform Your Fitness Journey</h1>
          <p>Track, analyze, and optimize your workouts with our AI-powered fitness platform</p>
          <button 
            onClick={() => isLoggedIn ? navigate('/dashboard') : navigate('/login')}
            className="cta-button"
          >
            {isLoggedIn ? 'Go to Dashboard' : 'Get Started'}
          </button>
        </div>
      </div>
      
      {/* Description Section */}
      <div className="description-section">
        <h2>Your Personal Fitness Companion</h2>
        <div className="feature-container">
          <div className="feature">
            <div className="feature-icon">📊</div>
            <h3>Track Progress</h3>
            <p>Monitor your workouts, nutrition, and body metrics in one place</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🎯</div>
            <h3>Set Goals</h3>
            <p>Define custom fitness goals and track your journey towards achieving them</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🤖</div>
            <h3>AI Insights</h3>
            <p>Get personalized recommendations based on your performance and goals</p>
          </div>
        </div>
      </div>
      
      {/* NEW Visualization Section */}
      <div className="visualization-section">
        <div className="visualization-content">
          <div className="visualization-text">
            <h2>Visual Progress Tracking</h2>
            <p>Watch your fitness journey unfold through intuitive visualizations</p>
            <ul className="visualization-features">
              <li>
                <div className="feature-dot"></div>
                <span>Compare monthly progress with interactive bar charts</span>
              </li>
              <li>
                <div className="feature-dot"></div>
                <span>Track calories, weight, steps, and workouts over time</span>
              </li>
              <li>
                <div className="feature-dot"></div>
                <span>Identify trends with smart line graphs and analytics</span>
              </li>
              <li>
                <div className="feature-dot"></div>
                <span>Set visual targets and celebrate achievements</span>
              </li>
            </ul>
            {/* <button 
              onClick={() => isLoggedIn ? navigate('/dashboard') : navigate('/login')}
              className="viz-cta-button"
            >
              {isLoggedIn ? 'View My Stats' : 'Start Tracking'}
            </button> */}
          </div>
          <div className="visualization-image">
            <img src={trackingVisualization} alt="Fitness tracking visualization showing run stats" />
          </div>
        </div>
      </div>
      
      {/* Plans Section with image background */}
      <div className="plans-section" style={{ backgroundImage: `url(${homepageImg2})` }}>
        <h2>Choose Your Fitness Plan</h2>
        <div className="plans-container">
          {/* Beginner Plan */}
          <div className="plan-card">
            <div className="plan-header beginner">
              <h3>Beginner</h3>
            </div>
            <div className="plan-content">
              <ul>
                <li>✓ Basic workout templates</li>
                <li>✓ Progress tracking</li>
                <li>✓ Community support</li>
                <li>✗ Personalized plans</li>
                <li>✗ Advanced analytics</li>
              </ul>
              <div className="plan-price">
                <span className="price">$9.99</span>
                <span className="period">/month</span>
              </div>
            </div>
          </div>
          
          {/* Intermediate Plan */}
          <div className="plan-card featured">
            <div className="plan-badge">Most Popular</div>
            <div className="plan-header intermediate">
              <h3>Intermediate</h3>
            </div>
            <div className="plan-content">
              <ul>
                <li>✓ All Beginner features</li>
                <li>✓ Personalized workout plans</li>
                <li>✓ Nutrition tracking</li>
                <li>✓ Weekly progress reports</li>
                <li>✗ 1-on-1 coaching</li>
              </ul>
              <div className="plan-price">
                <span className="price">$19.99</span>
                <span className="period">/month</span>
              </div>
            </div>
          </div>
          
          {/* Advanced Plan */}
          <div className="plan-card">
            <div className="plan-header advanced">
              <h3>Advanced</h3>
            </div>
            <div className="plan-content">
              <ul>
                <li>✓ All Intermediate features</li>
                <li>✓ Advanced performance analytics</li>
                <li>✓ 1-on-1 coaching sessions</li>
                <li>✓ Custom nutrition plans</li>
                <li>✓ Priority support</li>
              </ul>
              <div className="plan-price">
                <span className="price">$29.99</span>
                <span className="period">/month</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="testimonials-section">
        <h2>What Our Users Say</h2>
        <div className="testimonials-container">
          <div className="testimonial">
            <p>"This app transformed my fitness journey. I've lost 15 pounds and feel stronger than ever!"</p>
            <div className="testimonial-author">- Alex M.</div>
          </div>
          <div className="testimonial">
            <p>"The personalized plans and tracking features make it easy to stay consistent with my workouts."</p>
            <div className="testimonial-author">- Sarah K.</div>
          </div>
          <div className="testimonial">
            <p>"As a fitness trainer, I recommend this app to all my clients. The progress tracking is unmatched."</p>
            <div className="testimonial-author">- Mike T.</div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Footer */}
      <footer className="homepage-footer">
        <div className="footer-content">
          <div className="footer-logo">Fitness Tracker</div>
          <div className="footer-links">
            <a href="/about">About Us</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/contact">Contact Us</a>
            <a href="/faq">FAQ</a>
          </div>
          <p>&copy; 2025 Fitness Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import '../styles/homepage.css';
// // Import images
// import homepageImg1 from '../assets/homepageimg1.jpg'; // Adjust path as needed
// import homepageImg2 from '../assets/homepageimg2.jpg'; // Adjust path as needed 

// const HomePage = () => {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const navigate = useNavigate();
  
//   useEffect(() => {
//     const auth = getAuth();
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user && user.emailVerified) {
//         setIsLoggedIn(true);
//       } else {
//         setIsLoggedIn(false);
//       }
//     });
    
//     return () => unsubscribe();
//   }, []);
  
//   const handlePlanSelection = (plan) => {
//     if (isLoggedIn) {
//       // For now just redirect to dashboard, later you can implement payment flow
//       navigate('/dashboard', { state: { selectedPlan: plan } });
//     } else {
//       navigate('/login');
//     }
//   };
  
//   return (
//     <div className="homepage-container">
//       {/* Header */}
//       <header className="homepage-header">
//         <div className="logo">FitnessTracker</div>
//         <div className="nav-buttons">
//           {isLoggedIn ? (
//             <button 
//               onClick={() => navigate('/dashboard')}
//               className="nav-button"
//             >
//               Dashboard
//             </button>
//           ) : (
//             <>
//               <button 
//                 onClick={() => navigate('/login')}
//                 className="nav-button login-btn"
//               >
//                 Log In
//               </button>
//               <button 
//                 onClick={() => navigate('/signup')}
//                 className="nav-button signup-btn"
//               >
//                 Sign Up
//               </button>
//             </>
//           )}
//         </div>
//       </header>
      
//       {/* Hero Section with Fitness Photo */}
//       <div className="hero-section" style={{ backgroundImage: `url(${homepageImg1})` }}>
//         <div className="hero-overlay">
//           <h1>Transform Your Fitness Journey</h1>
//           <p>Track, analyze, and optimize your workouts with our AI-powered fitness platform</p>
//           <button 
//             onClick={() => isLoggedIn ? navigate('/dashboard') : navigate('/login')}
//             className="cta-button"
//           >
//             {isLoggedIn ? 'Go to Dashboard' : 'Get Started'}
//           </button>
//         </div>
//       </div>
      
//       {/* Description Section */}
//       <div className="description-section">
//         <h2>Your Personal Fitness Companion</h2>
//         <div className="feature-container">
//           <div className="feature">
//             <div className="feature-icon">📊</div>
//             <h3>Track Progress</h3>
//             <p>Monitor your workouts, nutrition, and body metrics in one place</p>
//           </div>
//           <div className="feature">
//             <div className="feature-icon">🎯</div>
//             <h3>Set Goals</h3>
//             <p>Define custom fitness goals and track your journey towards achieving them</p>
//           </div>
//           <div className="feature">
//             <div className="feature-icon">🤖</div>
//             <h3>AI Insights</h3>
//             <p>Get personalized recommendations based on your performance and goals</p>
//           </div>
//         </div>
//       </div>
      
//       {/* Plans Section with image background */}
//       <div className="plans-section" style={{ backgroundImage: `url(${homepageImg2})` }}>
//         <h2>Choose Your Fitness Plan</h2>
//         <div className="plans-container">
//           {/* Beginner Plan */}
//           <div className="plan-card">
//             <div className="plan-header beginner">
//               <h3>Beginner</h3>
//             </div>
//             <div className="plan-content">
//               <ul>
//                 <li>✓ Basic workout templates</li>
//                 <li>✓ Progress tracking</li>
//                 <li>✓ Community support</li>
//                 <li>✗ Personalized plans</li>
//                 <li>✗ Advanced analytics</li>
//               </ul>
//               <div className="plan-price">
//                 <span className="price">$9.99</span>
//                 <span className="period">/month</span>
//               </div>
//               {/* Start Now button removed */}
//             </div>
//           </div>
          
//           {/* Intermediate Plan */}
//           <div className="plan-card featured">
//             <div className="plan-badge">Most Popular</div>
//             <div className="plan-header intermediate">
//               <h3>Intermediate</h3>
//             </div>
//             <div className="plan-content">
//               <ul>
//                 <li>✓ All Beginner features</li>
//                 <li>✓ Personalized workout plans</li>
//                 <li>✓ Nutrition tracking</li>
//                 <li>✓ Weekly progress reports</li>
//                 <li>✗ 1-on-1 coaching</li>
//               </ul>
//               <div className="plan-price">
//                 <span className="price">$19.99</span>
//                 <span className="period">/month</span>
//               </div>
//               {/* Start Now button removed */}
//             </div>
//           </div>
          
//           {/* Advanced Plan */}
//           <div className="plan-card">
//             <div className="plan-header advanced">
//               <h3>Advanced</h3>
//             </div>
//             <div className="plan-content">
//               <ul>
//                 <li>✓ All Intermediate features</li>
//                 <li>✓ Advanced performance analytics</li>
//                 <li>✓ 1-on-1 coaching sessions</li>
//                 <li>✓ Custom nutrition plans</li>
//                 <li>✓ Priority support</li>
//               </ul>
//               <div className="plan-price">
//                 <span className="price">$29.99</span>
//                 <span className="period">/month</span>
//               </div>
//               {/* Start Now button removed */}
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {/* Testimonials Section */}
//       <div className="testimonials-section">
//         <h2>What Our Users Say</h2>
//         <div className="testimonials-container">
//           <div className="testimonial">
//             <p>"This app transformed my fitness journey. I've lost 15 pounds and feel stronger than ever!"</p>
//             <div className="testimonial-author">- Alex M.</div>
//           </div>
//           <div className="testimonial">
//             <p>"The personalized plans and tracking features make it easy to stay consistent with my workouts."</p>
//             <div className="testimonial-author">- Sarah K.</div>
//           </div>
//           <div className="testimonial">
//             <p>"As a fitness trainer, I recommend this app to all my clients. The progress tracking is unmatched."</p>
//             <div className="testimonial-author">- Mike T.</div>
//           </div>
//         </div>
//       </div>
      
//       {/* Enhanced Footer */}
//       <footer className="homepage-footer">
//         <div className="footer-content">
//           <div className="footer-logo">Fitness Tracker</div>
//           <div className="footer-links">
//             <a href="/about">About Us</a>
//             <a href="/privacy">Privacy Policy</a>
//             <a href="/terms">Terms of Service</a>
//             <a href="/contact">Contact Us</a>
//             <a href="/faq">FAQ</a>
//           </div>
//           <p>&copy; 2025 Fitness Tracker. All rights reserved.</p>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default HomePage;