import React, { useState } from 'react';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  getMultiFactorResolver
} from 'firebase/auth';
import { RecaptchaVerifier } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../styles/signup.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [verificationId, setVerificationId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [resolver, setResolver] = useState(null);

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
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      // If we reach here, MFA is not enabled or not required
      navigate('/dashboard');
      
    } catch (err) {
      // Handle MFA specific error
      if (err.code === 'auth/multi-factor-auth-required') {
        // Set up MFA verification
        setMfaRequired(true);
        
        // Get the resolver
        const auth = getAuth();
        const multiFactorResolver = getMultiFactorResolver(auth, err);
        setResolver(multiFactorResolver);
        
        // Set up reCAPTCHA
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'normal'
        });
        
        // Send verification code
        const phoneInfoOptions = {
          multiFactorHint: multiFactorResolver.hints[0],
          session: multiFactorResolver.session
        };
        
        const phoneAuthProvider = new PhoneAuthProvider(auth);
        const verificationId = await phoneAuthProvider.verifyPhoneNumber(
          phoneInfoOptions, 
          window.recaptchaVerifier
        );
        
        setVerificationId(verificationId);
        setLoading(false);
        return;
      }
      
      // Handle other errors
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
      console.error("Login error:", err);
      
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMfa = async () => {
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      
      // Create credential
      const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      
      // Complete sign-in
      await resolver.resolveSignIn(multiFactorAssertion);
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (err) {
      console.error('MFA verification error:', err);
      setError('Failed to verify MFA code: ' + (err.message || err.code || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h2>Log In</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {!mfaRequired ? (
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
      ) : (
        <div className="mfa-verification-container">
          <h3>Two-Factor Authentication Required</h3>
          <p>Please enter the verification code sent to your phone.</p>
          
          <div id="recaptcha-container"></div>
          
          <div className="form-group">
            <label htmlFor="verificationCode">Verification Code</label>
            <input
              type="text"
              id="verificationCode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
          </div>
          
          <button 
            onClick={handleVerifyMfa} 
            className="signup-button" 
            disabled={loading || !verificationCode}
          >
            {loading ? 'Verifying...' : 'Verify & Sign In'}
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginForm;

// import React, { useState } from 'react';
// import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
// import { useNavigate } from 'react-router-dom'; // Import for navigation
// import '../styles/signup.css';

// const LoginForm = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate(); // Hook for navigation

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const auth = getAuth();
//       await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
//       // Redirect to dashboard after successful login
//       navigate('/dashboard');
//     } catch (err) {
//       let errorMessage = 'Failed to sign in';
      
//       if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
//         errorMessage = 'Invalid email or password';
//       } else if (err.code === 'auth/invalid-email') {
//         errorMessage = 'Invalid email address';
//       } else if (err.code === 'auth/too-many-requests') {
//         errorMessage = 'Too many failed login attempts. Please try again later.';
//       } else if (err.message) {
//         errorMessage = err.message;
//       }
      
//       setError(errorMessage);
//       console.error("Login error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="signup-container">
//       <h2>Log In</h2>
      
//       {error && <div className="error-message">{error}</div>}
      
//       <form onSubmit={handleLogin} className="signup-form">
//         <div className="form-group">
//           <label htmlFor="email">Email</label>
//           <input
//             type="email"
//             id="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="password">Password</label>
//           <input
//             type="password"
//             id="password"
//             name="password"
//             value={formData.password}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         <button type="submit" className="signup-button" disabled={loading}>
//           {loading ? 'Signing In...' : 'Sign In'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default LoginForm;