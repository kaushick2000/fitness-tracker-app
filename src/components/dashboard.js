import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Nav from './Nav'; // Import the Nav component
import '../styles/dashboard.css';

const Dashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        navigate('/login');
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);

  const handlePayment = (plan) => {
    // Navigate to payment page with selected plan
    navigate('/payment', { state: { selectedPlan: plan } });
  };

  return (
    <div className="dashboard-container">
      {/* Nav Component */}
      <Nav />

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="dashboard-title">
            <h1>Dashboard</h1>
          </div>
          <div className="user-profile">
            <div className="user-avatar"></div>
            <div className="cart-icon">🛒</div>
            <div className="menu-icon">⋮</div>
          </div>
        </header>

        {/* Greeting Section */}
        <div className="greeting-section">
          <h2>Greetings</h2>
          <p>Wrap up your day by checking how far you've come—your dashboard awaits.</p>
        </div>

        {/* Activity Section */}
        <div className="activity-section">
          <div className="section-header">
            <h2>Activity</h2>
            <div className="dropdown">
              <span>Monthly</span>
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>

          <div className="activity-content">
            {/* Progress Circle */}
            <div className="progress-card">
              <div className="progress-header">
                <h3>Progress</h3>
                <div className="dropdown">
                  <span>Weekly</span>
                  <span className="dropdown-arrow">▼</span>
                </div>
              </div>

              <div className="progress-circle-container">
                <div className="progress-circle">
                  <div className="inner-circle">
                    <span className="value">40hrs</span>
                    <span className="label">Stretching</span>
                  </div>
                </div>
              </div>

              <div className="exercise-list">
                <div className="exercise-item">
                  <span className="exercise-dot cardio"></span>
                  <span className="exercise-name">Cardio</span>
                  <span className="exercise-value">30 hrs</span>
                </div>
                <div className="exercise-item">
                  <span className="exercise-dot stretching"></span>
                  <span className="exercise-name">Stretching</span>
                  <span className="exercise-value">40 hrs</span>
                </div>
                <div className="exercise-item">
                  <span className="exercise-dot treadmill"></span>
                  <span className="exercise-name">Treadmill</span>
                  <span className="exercise-value">30 hrs</span>
                </div>
                <div className="exercise-item">
                  <span className="exercise-dot strength"></span>
                  <span className="exercise-name">Strength</span>
                  <span className="exercise-value">20 hrs</span>
                </div>
              </div>
            </div>

            {/* Activity Graph */}
            <div className="activity-graph">
              <div className="graph-container">
                <div className="bar-chart">
                  <div className="bar" style={{height: '30%'}}><span>30%</span></div>
                  <div className="bar" style={{height: '70%'}}><span>70%</span></div>
                  <div className="bar" style={{height: '50%'}}><span>50%</span></div>
                  <div className="bar" style={{height: '60%'}}><span>60%</span></div>
                  <div className="bar" style={{height: '8%'}}><span>8%</span></div>
                  <div className="bar" style={{height: '12%'}}><span>12%</span></div>
                  <div className="bar" style={{height: '11%'}}><span>11%</span></div>
                  <div className="bar" style={{height: '10%'}}><span>10%</span></div>
                </div>
                <div className="month-labels">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Food Section */}
        <div className="food-section">
          <div className="section-header">
            <h2>Recommended food</h2>
            <div className="dropdown">
              <span>Monthly</span>
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>

          <div className="food-content">
            <div className="food-day">
              <h4>Day one</h4>
              <div className="food-item">
                <h3>Veggis and Hummus</h3>
              </div>
            </div>
            <div className="food-day">
              <h4>Day two</h4>
              <div className="food-item">
                <h3>Oatmeal with fruits</h3>
              </div>
            </div>
            <div className="food-day">
              <h4>Day three</h4>
              <div className="food-item">
                <h3>Green variety foods</h3>
              </div>
            </div>
            <div className="food-day">
              <h4>Day four</h4>
              <div className="food-item">
                <h3>A bowl of berries</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="subscription-section">
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
                <button 
                  className="plan-button"
                  onClick={() => handlePayment('beginner')}
                >
                  Buy Now
                </button>
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
                <button 
                  className="plan-button"
                  onClick={() => handlePayment('intermediate')}
                >
                  Buy Now
                </button>
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
                <button 
                  className="plan-button"
                  onClick={() => handlePayment('advanced')}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="dashboard-footer">
          <p>&copy; 2025 Fitness Tracker. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;