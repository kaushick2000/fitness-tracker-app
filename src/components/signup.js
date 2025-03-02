import React, { useState, useEffect } from 'react';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  sendEmailVerification
} from 'firebase/auth';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import '../styles/signup.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false); // Track if signup is complete

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('All fields are required');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (isSignedUp) {
      toast.error('You’ve already signed up. Please verify your email.');
      return;
    }

    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      const { firstName, lastName, email, password } = formData;

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      await updateProfile(user, { 
        displayName: `${firstName} ${lastName}` 
      });

      // Store additional user data in Firestore
      const db = getFirestore();
      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        firstName,
        lastName,
        email,
        hasMfa: false, // No MFA needed now
        createdAt: new Date().toISOString(),
      });

      // Send email verification
      await sendEmailVerification(user);
      
      // Mark signup as complete and show verification prompt
      setIsSignedUp(true);
      toast.info('Please verify your email before proceeding. A verification link has been sent to your email.');
      setLoading(false);

      // Clear form data to prevent reuse
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });

    } catch (err) {
      let errorMessage = 'Failed to create account';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Poll or listen for email verification and redirect to login
  useEffect(() => {
    const auth = getAuth();
    let intervalId; // For polling

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log('Auth state changed - User:', user, 'Email Verified:', user.emailVerified);
        if (!user.emailVerified) {
          // Reload user to fetch the latest state
          await user.reload();
          console.log('Reloaded User - Email Verified:', user.emailVerified);
        }
        if (user.emailVerified && isSignedUp) {
          setEmailVerified(true);
          toast.success('Email verified successfully! Redirecting to login...');
          setTimeout(() => {
            navigate('/login'); // Redirect to /login immediately
            setIsSignedUp(false); // Reset signup state after successful verification
          }, 1000); // Reduced delay to 1 second for faster redirection
        }
      }
    });

    // Start polling every 5 seconds if signup is complete but email isn’t verified
    if (isSignedUp && !emailVerified) {
      intervalId = setInterval(async () => {
        const user = auth.currentUser;
        if (user) {
          await user.reload();
          console.log('Polling - Email Verified:', user.emailVerified);
          if (user.emailVerified) {
            setEmailVerified(true);
            toast.success('Email verified successfully! Redirecting to login...');
            setTimeout(() => {
              navigate('/login');
              setIsSignedUp(false);
            }, 1000);
            clearInterval(intervalId); // Stop polling once verified
          }
        }
      }, 5000); // Poll every 5 seconds
    }

    return () => {
      unsubscribe();
      if (intervalId) clearInterval(intervalId); // Cleanup polling
    };
  }, [navigate, isSignedUp, emailVerified]);

  return (
    <div className="signup-container">
      <h2>Create Account</h2>
      
      {error && <div className="error-message">{error}</div>}
      {emailVerified && (
        <div className="success-message">
          Email verified successfully! Redirecting to login...
        </div>
      )}
      {isSignedUp && !emailVerified && !error && (
        <div className="success-message">
          Please check your email to verify your account.
        </div>
      )}
      
      {!isSignedUp && (
        <form onSubmit={handleSignup} className="signup-form">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input 
              type="text" 
              id="firstName" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input 
              type="text" 
              id="lastName" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleChange} 
              required 
            />
          </div>

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
              minLength="6" 
            />
            <small>Password must be at least 6 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              required 
            />
          </div>

          <button type="submit" className="signup-button" disabled={loading || isSignedUp}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
      )}

      {/* Optional: Uncomment for debugging if automatic redirection fails */}
      {/* {isSignedUp && !emailVerified && !error && (
        <button 
          onClick={async () => {
            const auth = getAuth();
            const user = auth.currentUser;
            if (user) {
              await user.reload();
              console.log('Manual Check - Email Verified:', user.emailVerified);
              if (user.emailVerified) {
                setEmailVerified(true);
                toast.success('Email verified successfully! Redirecting to login...');
                setTimeout(() => navigate('/login'), 1000);
              } else {
                toast.error('Email not verified yet. Please check your email.');
              }
            }
          }} 
          className="signup-button" 
          style={{ marginTop: '10px', width: 'auto' }}
        >
          Check Verification Status
        </button>
      )} */}
    </div>
  );
};

export default SignupForm;

