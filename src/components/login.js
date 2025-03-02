import React, { useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Import toast
import '../styles/signup.css'; // Or '../styles/login.css' if separate

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        await sendEmailVerification(user);
        toast.error('Please verify your email before logging in. A verification link has been sent to your email.');
        setLoading(false);
        return;
      }

      // If email is verified, navigate to dashboard
      setEmailVerified(true);
      toast.success('Logged in successfully! Redirecting to dashboard...');
      navigate('/dashboard');

    } catch (err) {
      let errorMessage = 'Failed to sign in';

      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Poll or listen for email verification
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.emailVerified && emailVerified) {
        toast.success('Email verified successfully! Redirecting to dashboard...');
        navigate('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [emailVerified, navigate]);

  return (
    <div className="signup-container">
      <h2>Log In</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleLogin} className="signup-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
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
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="signup-button" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      {/* Add Sign Up button/link at the bottom */}
      <button 
        onClick={() => navigate('/signup')} 
        className="secondary-button"
        style={{ marginTop: '15px' }}
      >
        Not signed up? Click here to sign up
      </button>
    </div>
  );
};

export default LoginForm;
