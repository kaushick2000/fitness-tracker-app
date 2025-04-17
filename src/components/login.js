/* Last Name, First Name - Student ID */
/* 
 Suresh, Kaushick ( 1002237680 ), 
 Sivaprakash, Akshay Prassanna ( 1002198274 ) ,  
 Sonwane, Pratik ( 1002170610 ) , 
 Shaik, Arfan ( 1002260039 ) , 
 Sheth, Jeet ( 1002175315 ) 
*/

import React, { useState, useEffect } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/signup.css";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        await sendEmailVerification(user);
        toast.error(
          "Please verify your email before logging in. A verification link has been sent to your email."
        );
        setLoading(false);
        return;
      }

      // If email is verified, store login in MySQL database through API
      try {
        const loginTimestamp = new Date().toISOString();

        const apiResponse = await fetch("http://localhost:3000/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: user.uid, // Using Firebase UID as the password
            loginTimestamp: loginTimestamp,
          }),
        });

        if (!apiResponse.ok) {
          const errorData = await apiResponse.json();
          console.error("MySQL database login verification failed:", errorData);
          // Don't fail the whole login if MySQL verification fails
          // Just log it and continue
        } else {
          const userData = await apiResponse.json();
          console.log("User data from MySQL:", userData);
          localStorage.setItem("userId", JSON.stringify(userData.user.user_id));
          // Update the last login time in MySQL
          const updateResponse = await fetch(
            "http://localhost:3000/api/login",
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: formData.email,
                last_login: loginTimestamp,
              }),
            }
          );

          const updateData = await updateResponse.json();
          console.log("Last login update response:", updateData);
        }
      } catch (mysqlError) {
        console.error("Error verifying with MySQL:", mysqlError);
        // Continue with login even if MySQL verification fails
      }

      // If email is verified, navigate to dashboard
      setEmailVerified(true);
      toast.success("Logged in successfully! Redirecting to dashboard...");
      navigate("/dashboard");
    } catch (err) {
      let errorMessage = "Failed to sign in";

      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        errorMessage = "Invalid email or password";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage =
          "Too many failed login attempts. Please try again later.";
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
        toast.success(
          "Email verified successfully! Redirecting to dashboard..."
        );
        localStorage.setItem("userEmail", formData.email);
        navigate("/dashboard");
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
            placeholder="Enter your email"
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
            placeholder="Enter your password"
          />
          {/* Add forgot password link */}
          <div style={{ textAlign: "right", marginTop: "0.5rem" }}>
            <Link
              to="/forgot-password"
              style={{
                color: "#007bff",
                textDecoration: "none",
                fontSize: "0.875rem",
              }}
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <button type="submit" className="signup-button" disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      {/* Add Sign Up button/link at the bottom with responsive styling */}
      <button
        onClick={() => navigate("/signup")}
        className="secondary-button"
        style={{ marginTop: "1rem" }}
      >
        Not signed up? Click here to sign up
      </button>
    </div>
  );
};

export default LoginForm;
// import React, { useState, useEffect } from 'react';
// import { getAuth, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
// import { useNavigate, Link } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import '../styles/signup.css';

// const LoginForm = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [emailVerified, setEmailVerified] = useState(false);
//   const navigate = useNavigate();

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
//       const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
//       const user = userCredential.user;

//       // Check if email is verified
//       if (!user.emailVerified) {
//         await sendEmailVerification(user);
//         toast.error('Please verify your email before logging in. A verification link has been sent to your email.');
//         setLoading(false);
//         return;
//       }

//       // If email is verified, navigate to dashboard
//       setEmailVerified(true);
//       toast.success('Logged in successfully! Redirecting to dashboard...');
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
//       toast.error(errorMessage);
//       console.error("Login error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Poll or listen for email verification
//   useEffect(() => {
//     const auth = getAuth();
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       if (user && user.emailVerified && emailVerified) {
//         toast.success('Email verified successfully! Redirecting to dashboard...');
//         navigate('/dashboard');
//       }
//     });

//     return () => unsubscribe();
//   }, [emailVerified, navigate]);

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
//             placeholder="Enter your email"
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
//             placeholder="Enter your password"
//           />
//           {/* Add forgot password link */}
//           <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
//             <Link
//               to="/forgot-password"
//               style={{
//                 color: '#007bff',
//                 textDecoration: 'none',
//                 fontSize: '0.875rem'
//               }}
//             >
//               Forgot Password?
//             </Link>
//           </div>
//         </div>

//         <button type="submit" className="signup-button" disabled={loading}>
//           {loading ? 'Signing In...' : 'Sign In'}
//         </button>
//       </form>

//       {/* Add Sign Up button/link at the bottom with responsive styling */}
//       <button
//         onClick={() => navigate('/signup')}
//         className="secondary-button"
//         style={{ marginTop: '1rem' }}
//       >
//         Not signed up? Click here to sign up
//       </button>
//     </div>
//   );
// };

// export default LoginForm;
