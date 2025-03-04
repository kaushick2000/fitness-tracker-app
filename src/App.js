import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './components/Firebase'; // Import Firebase initialization
import SignupForm from './components/Signup';
import LoginForm from './components/Login';
import Dashboard from './components/dashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import react-toastify CSS
import './styles/dashboard.css'; // Import dashboard CSS
import ProgressDashboard from './components/ProgressDashboard';
import './styles/progressdashboard.css';
function App() {
  return (
    <Router>
      <div className="App">
        <ToastContainer />
        <Routes>
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/progress" element={<ProgressDashboard/>} />
          {/* Default route redirects to /login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;