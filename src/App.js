import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './components/firebase'
import SignupForm from './components/signup'; 
import LoginForm from './components/login'; 
import './styles/dashboard.css';  
import Dashboard from './components/dashboard';
function App() {
  return (
    <div className="App">
      <Router>
      <div className="App">
        <Routes>
          <Route path="/signup" element={<SignupForm />} /> 
          <Route path="/login" element={<LoginForm />} /> 
          <Route path="/dashboard" element={<Dashboard />} />
          
          </Routes>
      </div>
    </Router>
    </div>
  );
}

export default App;
