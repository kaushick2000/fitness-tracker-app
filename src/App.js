import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './components/Firebase'; // Import Firebase initialization
import SignupForm from './components/Signup';
import LoginForm from './components/Login';
import Dashboard from './components/Dashboard';
import ActivityLogging from './components/ActivityLogging';
import HomePage from './components/HomePage'; // Import the new HomePage component
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import react-toastify CSS
import './styles/dashboard.css'; // Import dashboard CSS
import './styles/homepage.css'; // Import homepage CSS
import ProgressDashboard from './components/ProgressDashboard';
import './styles/progressdashboard.css';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Profile from './components/Profile';
import SubscriptionPayment from './components/SubscriptionPayment';
// import PaymentSuccess from './components/PaymentSuccess';
import ContactUs from './components/ContacUs';
import Trainer from './components/Trainer';
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
          <Route path="/activitylogging" element={<ActivityLogging/>} />
          <Route path="/analytics" element={<AnalyticsDashboard/>} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/home" element={<HomePage />} /> 
          <Route path="/plans" element={<SubscriptionPayment/>} /> 
          <Route path='/contact' element={<ContactUs/>}/>
          <Route path='/trainer' element={<Trainer/>}/>
          
          {/* <Route path="/payment" element={<Payment />} />
          <Route path="/payment-success" element={<PaymentSuccess />} /> */}
          {/* Default route redirects to home page instead of login */}
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;