import React, { useState } from 'react';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  sendEmailVerification,
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator
} from 'firebase/auth';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import { RecaptchaVerifier } from 'firebase/auth';
import '../styles/signup.css';
import { useNavigate } from 'react-router-dom';

const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '' // Added for MFA
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [verificationId, setVerificationId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newUser, setNewUser] = useState(null);

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
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);

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
        hasMfa: false, // Adding MFA status flag
        createdAt: new Date().toISOString(),
      });

      // Send email verification
      await sendEmailVerification(user);
      
      setNewUser(user); // Save user for MFA setup
      setSuccess(true);
      setShowMfaSetup(true); // Show MFA setup option
      
    } catch (err) {
      let errorMessage = 'Failed to create account';
      
      // Firebase error handling
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
    } finally {
      setLoading(false);
    }
  };

  const setupMFA = async () => {
    if (!formData.phoneNumber) {
      setError('Phone number is required for MFA setup');
      return;
    }

    try {
      setLoading(true);
      const auth = getAuth();
      
      // Create a new RecaptchaVerifier
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal',
        'callback': () => {
          // reCAPTCHA solved, allow sending verification code
        }
      });
      
      // Get the current user's multiFactor session
      const user = newUser || auth.currentUser;
      const multiFactorSession = await multiFactor(user).getSession();
      
      // Send verification code to the user's phone
      const phoneInfoOptions = {
        phoneNumber: formData.phoneNumber,
        session: multiFactorSession
      };
      
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        phoneInfoOptions, 
        window.recaptchaVerifier
      );
      
      setVerificationId(verificationId);
      setError(null);
      alert('Verification code sent to your phone!');
      
    } catch (err) {
      console.error('MFA setup error:', err);
      setError('Failed to set up MFA: ' + (err.message || err.code || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const completeMfaSetup = async () => {
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    try {
      setLoading(true);
      const auth = getAuth();
      const user = newUser || auth.currentUser;
      
      // Create the phone second factor
      const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      
      // Enroll the second factor
      await multiFactor(user).enroll(multiFactorAssertion, 'Phone Number');
      
      // Update the user's MFA status in Firestore
      const db = getFirestore();
      await setDoc(doc(db, "users", user.uid), {
        hasMfa: true,
        phoneNumber: formData.phoneNumber
      }, { merge: true });
      
      setSuccess(true);
      setShowMfaSetup(false);
      alert('MFA set up successfully! You will now need to verify your phone when signing in.');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: ''
      });
      
      // Redirect to sign-in page
      navigate('/signin');
      
    } catch (err) {
      console.error('MFA enrollment error:', err);
      setError('Failed to complete MFA setup: ' + (err.message || err.code || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const skipMfaSetup = () => {
    // Reset form and redirect
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: ''
    });
    
    navigate('/signin');
  };

  return (
    <div className="signup-container">
      <h2>Create Account</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && !showMfaSetup && (
        <div className="success-message">
          Account created successfully! Please check your email to verify your account.
        </div>
      )}
      
      {!showMfaSetup ? (
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

          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
      ) : (
        <div className="mfa-setup-container">
          <h3>Set Up Multi-Factor Authentication (Recommended)</h3>
          <p>Enhance your account security by adding a phone number for verification when you sign in.</p>
          
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number (with country code, e.g., +1234567890)</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+1234567890"
            />
          </div>
          
          {!verificationId ? (
            <>
              <div id="recaptcha-container"></div>
              <button 
                onClick={setupMFA} 
                className="signup-button" 
                disabled={loading || !formData.phoneNumber}
              >
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </button>
            </>
          ) : (
            <div className="form-group">
              <label htmlFor="verificationCode">Enter Verification Code</label>
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
              <button 
                onClick={completeMfaSetup} 
                className="signup-button" 
                disabled={loading || !verificationCode}
              >
                {loading ? 'Verifying...' : 'Complete MFA Setup'}
              </button>
            </div>
          )}
          
          <button onClick={skipMfaSetup} className="secondary-button">
            Skip MFA Setup (Not Recommended)
          </button>
        </div>
      )}
    </div>
  );
};

export default SignupForm;




// import React, { useState } from 'react';
// import { 
//   getAuth, 
//   createUserWithEmailAndPassword, 
//   updateProfile, 
//   sendEmailVerification
// } from 'firebase/auth';
// import { getFirestore, setDoc, doc } from 'firebase/firestore';
// import '../styles/signup.css';

// const SignupForm = () => {
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     password: '',
//     confirmPassword: ''
//   });
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const validateForm = () => {
//     if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
//       setError('All fields are required');
//       return false;
//     }
    
//     if (formData.password.length < 6) {
//       setError('Password must be at least 6 characters');
//       return false;
//     }
    
//     if (formData.password !== formData.confirmPassword) {
//       setError('Passwords do not match');
//       return false;
//     }
    
//     return true;
//   };

//   const handleSignup = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) return;
    
//     setLoading(true);
//     setError(null);
//     setSuccess(false);

//     try {
//       const auth = getAuth();
//       const { firstName, lastName, email, password } = formData;

//       // Create user with email and password
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;
      
//       // Update profile with display name
//       await updateProfile(user, { 
//         displayName: `${firstName} ${lastName}` 
//       });

//       // Store additional user data in Firestore
//       const db = getFirestore();
//       await setDoc(doc(db, "users", user.uid), {
//         id: user.uid,
//         firstName,
//         lastName,
//         email,
//         createdAt: new Date().toISOString(),
//       });

//       // Send email verification
//       await sendEmailVerification(user);
      
//       setSuccess(true);
//       setFormData({
//         firstName: '',
//         lastName: '',
//         email: '',
//         password: '',
//         confirmPassword: ''
//       });
      
//     } catch (err) {
//       let errorMessage = 'Failed to create account';
      
//       // Firebase error handling
//       if (err.code === 'auth/email-already-in-use') {
//         errorMessage = 'This email is already registered';
//       } else if (err.code === 'auth/invalid-email') {
//         errorMessage = 'Invalid email address';
//       } else if (err.code === 'auth/weak-password') {
//         errorMessage = 'Password is too weak';
//       } else if (err.message) {
//         errorMessage = err.message;
//       }
      
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="signup-container">
//       <h2>Create Account</h2>
      
//       {error && <div className="error-message">{error}</div>}
//       {success && (
//         <div className="success-message">
//           Account created successfully! Please check your email to verify your account.
//         </div>
//       )}
      
//       <form onSubmit={handleSignup} className="signup-form">
//         <div className="form-group">
//           <label htmlFor="firstName">First Name</label>
//           <input 
//             type="text" 
//             id="firstName" 
//             name="firstName" 
//             value={formData.firstName} 
//             onChange={handleChange} 
//             required 
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="lastName">Last Name</label>
//           <input 
//             type="text" 
//             id="lastName" 
//             name="lastName" 
//             value={formData.lastName} 
//             onChange={handleChange} 
//             required 
//           />
//         </div>

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
//             minLength="6" 
//           />
//           <small>Password must be at least 6 characters</small>
//         </div>

//         <div className="form-group">
//           <label htmlFor="confirmPassword">Confirm Password</label>
//           <input 
//             type="password" 
//             id="confirmPassword" 
//             name="confirmPassword" 
//             value={formData.confirmPassword} 
//             onChange={handleChange} 
//             required 
//           />
//         </div>

//         <button type="submit" className="signup-button" disabled={loading}>
//           {loading ? 'Creating Account...' : 'Sign Up'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default SignupForm;