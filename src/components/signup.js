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
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import "../styles/signup.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false); // Track if signup is complete
  const [sqlStored, setSqlStored] = useState(false); // Track if MySQL storage is complete
  const [profileData, setProfileData] = useState(null); // Store profile data for display

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password
    ) {
      setError("All fields are required");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (isSignedUp) {
      toast.error("You've already signed up. Please verify your email.");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      const { firstName, lastName, email, password } = formData;

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update profile with display name
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
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

      // Store user data in MySQL database through API with profile and related records
      try {
        const apiResponse = await fetch("http://localhost:3000/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            password: user.uid, // Store Firebase UID as password for reference
            id: user.uid,
            createdAt: new Date().toISOString(),
          }),
          credentials: 'include',
        });

        if (!apiResponse.ok) {
          const errorData = await apiResponse.json();
          console.error("MySQL database storage failed:", errorData);
          // Continue with signup even if MySQL storage fails
        } else {
          const userData = await apiResponse.json();
          console.log("SQL database stored user with profile and related data:", userData);
          setSqlStored(true);
          setProfileData(userData.profile);
          toast.success("Account created successfully with default profile!");
        }
      } catch (mysqlError) {
        console.error("Error saving to MySQL:", mysqlError);
        // Continue with signup even if MySQL storage fails
      }

      // Send email verification
      await sendEmailVerification(user);

      // Mark signup as complete and show verification prompt
      setIsSignedUp(true);
      toast.info(
        "Please verify your email before proceeding. A verification link has been sent to your email."
      );
      setLoading(false);

      // Clear form data to prevent reuse
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      let errorMessage = "Failed to create account";

      switch (err.code) {
        case "auth/email-already-in-use":
          errorMessage = "This email is already registered";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        case "auth/weak-password":
          errorMessage = "Password is too weak";
          break;
        case "auth/network-request-failed":
          errorMessage =
            "Network error. Please check your connection and try again.";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "Operation not allowed. Please contact support.";
          break;
        default:
          errorMessage = err.message || "An unexpected error occurred";
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
        if (!user.emailVerified) {
          await user.reload();
        }
        if (user.emailVerified && isSignedUp) {
          setEmailVerified(true);
          toast.success("Email verified successfully! Redirecting to login...");
          setTimeout(() => {
            navigate("/login");
            setIsSignedUp(false);
          }, 2000); // Increased to 2 seconds for better UX
        }
      }
    });

    // Start polling every 5 seconds if signup is complete but email isn't verified
    if (isSignedUp && !emailVerified) {
      let pollCount = 0;
      const maxPolls = 60; // Poll for up to 5 minutes (60 * 5 seconds)
      intervalId = setInterval(async () => {
        const user = auth.currentUser;
        if (user) {
          await user.reload();
          if (user.emailVerified) {
            setEmailVerified(true);
            toast.success(
              "Email verified successfully! Redirecting to login..."
            );
            setTimeout(() => {
              navigate("/login");
              setIsSignedUp(false);
            }, 2000);
            clearInterval(intervalId);
          } else if (pollCount >= maxPolls) {
            toast.error(
              "Email verification timed out. Please check your email or try again."
            );
            clearInterval(intervalId);
          }
          pollCount++;
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
          {sqlStored && (
            <div>
              <p>Your profile has been created with default settings:</p>
              {profileData && (
                <ul>
                  <li>Height: {profileData.curr_height} cm</li>
                  <li>Weight: {profileData.curr_weight} kg</li>
                  <li>Default nutrition sample added</li>
                  <li>Initial progress record created</li>
                </ul>
              )}
              <p>You can update these values after logging in.</p>
            </div>
          )}
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
              placeholder="Enter your first name"
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
              placeholder="Enter your last name"
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
              minLength="6"
              placeholder="Enter your password"
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
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            className="signup-button"
            disabled={loading || isSignedUp}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
      )}
      <button
        onClick={() => navigate("/login")}
        className="secondary-button"
        style={{ marginTop: "1rem" }} /* Use rem for scalability */
      >
        Already signed up? Click here to login
      </button>
    </div>
  );
};

export default SignupForm;