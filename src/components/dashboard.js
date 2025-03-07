import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Redirect to login if not authenticated
        navigate('/login');
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavigateToProgress = () => {
    navigate('/progress');
  };
  const handleLogActivities = () => {
    navigate('/activitylogging');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Attendance System Dashboard</h1>
        <div className="user-info">
          <span>Logged in as: {user?.email}</span>
          <button onClick={handleSignOut} className="logout-button">Sign Out</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-button">Record Attendance</button>
            <button className="action-button">View Reports</button>
            <button className="action-button"  onClick={handleLogActivities}>Log Activities</button>
            <button 
              className="action-button progress-button"
              onClick={handleNavigateToProgress}
            >
              View Progress
            </button>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-time">9:30 AM</span>
              <span className="activity-desc">John Smith checked in</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">9:15 AM</span>
              <span className="activity-desc">Maria Johnson checked in</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">8:45 AM</span>
              <span className="activity-desc">David Williams checked in</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Attendance Summary</h2>
          <div className="summary-stats">
            <div className="stat-item">
              <h3>Today</h3>
              <p>23/25 Present</p>
            </div>
            <div className="stat-item">
              <h3>This Week</h3>
              <p>108/125 Present</p>
            </div>
            <div className="stat-item">
              <h3>This Month</h3>
              <p>478/500 Present</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;