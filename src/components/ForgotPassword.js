import React, { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/signup.css'; // Using the shared CSS

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEmail(e.target.value);
    // Clear any previous errors when the user starts typing
    if (error) setError(null);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      
      // Set success message
      setSuccess(true);
      toast.success('Password reset email sent! Please check your inbox.');
      
      // Clear email field after successful submission
      setEmail('');
    } catch (err) {
      let errorMessage = 'Failed to send password reset email';

      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Password reset error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h2>Reset Password</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="success-message">
          Password reset email sent! Please check your inbox and follow the instructions to reset your password.
        </div>
      )}
      
      <form onSubmit={handleForgotPassword} className="signup-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleChange}
            required
            placeholder="Enter your registered email"
            disabled={loading || success}
          />
          <small>We'll send a password reset link to this email address</small>
        </div>

        <button 
          type="submit" 
          className="signup-button" 
          disabled={loading || success}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      {/* Navigation options */}
      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button 
          onClick={() => navigate('/login')} 
          className="secondary-button"
        >
          Back to Login
        </button>
        
        <button 
          onClick={() => navigate('/signup')} 
          className="secondary-button"
        >
          Create New Account
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;