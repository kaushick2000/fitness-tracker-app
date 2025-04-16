import React, { useState, useEffect } from "react";
import Nav from "./Nav";
import "../styles/Profile.css";
import ProfilePic from "../assets/profilepic.jpg";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({});
  const [fitnessInfo, setFitnessInfo] = useState({});
  const [accountInfo, setAccountInfo] = useState({});
  const [purchasedPlans, setPurchasedPlans] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Get the user email from localStorage or context
        const userEmail = localStorage.getItem("userEmail");
        
        if (!userEmail) {
          setError("User not logged in");
          setLoading(false);
          return;
        }

        // Fetch user profile data from the API
        const response = await fetch(`http://localhost:3000/api/profile?email=${encodeURIComponent(userEmail)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }

        const data = await response.json();
        console.log("API response:", data);
        
        // Transform API data to the format used by the frontend
        const userData = data.user;
        const profileData = data.profile || {};
        
        // Map the API data structure to our local state structure
        setUser({
          ...userData,
          profile: profileData
        });
        
        // Parse fitness goals from JSON if needed
        const fitnessGoals = profileData.fitness_goals ? 
          (Array.isArray(profileData.fitness_goals) ? profileData.fitness_goals : JSON.parse(profileData.fitness_goals)) : 
          [];
          
        // Transform to frontend data structure
        setPersonalInfo({
          firstName: userData.name?.split(' ')[0] || '',
          lastName: userData.name?.split(' ')[1] || '',
          email: userData.email || '',
          phoneNumber: userData.phone || '',
          gender: profileData.gender || '',
          birthdate: profileData.birthday ? new Date(profileData.birthday).toISOString().split('T')[0] : '',
          height: profileData.height || '',
          currentWeight: profileData.curr_weight || '',
          goalWeight: profileData.goal_weight || '',
          profileImage: profileData.profile_pic || null
        });
        
        setFitnessInfo({
          fitnessLevel: profileData.fitness_level || '',
          activityLevel: '', // Not in the schema, but used in frontend
          workoutFrequency: 3, // Default value
          fitnessGoals: fitnessGoals,
          preferredWorkouts: [], // Not in schema, but used in frontend
          medicalConditions: [] // Not in schema, but used in frontend
        });
        
        setAccountInfo({
          username: userData.email?.split('@')[0] || '',
          memberSince: new Date(userData.created_at).toLocaleDateString() || '',
          subscription: userData.paid ? 'Premium' : 'Free',
          subscriptionRenewal: '',
          notificationPreferences: {
            email: true,
            push: false,
            sms: false
          },
          dataSharing: {
            anonymizedResearch: false,
            thirdPartyApps: false
          }
        });
        
        // Mock purchased plans (not in current API data)
        const mockPlans = userData.paid ? [{
          name: "Premium Fitness Plan",
          description: "Full access to all workouts and nutrition guides",
          purchaseDate: new Date().setMonth(new Date().getMonth() - 1),
          expiryDate: new Date().setMonth(new Date().getMonth() + 11)
        }] : [];
        
        setPurchasedPlans(mockPlans);
        
        // Save purchased plans to localStorage
        localStorage.setItem("purchasedPlans", JSON.stringify(mockPlans));
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message || "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoalChange = (goal) => {
    setFitnessInfo((prev) => ({
      ...prev,
      fitnessGoals: prev.fitnessGoals?.includes(goal)
        ? prev.fitnessGoals.filter((g) => g !== goal)
        : [...(prev.fitnessGoals || []), goal],
    }));
  };

  const handleWorkoutPreferenceChange = (workout) => {
    setFitnessInfo((prev) => ({
      ...prev,
      preferredWorkouts: prev.preferredWorkouts?.includes(workout)
        ? prev.preferredWorkouts.filter((w) => w !== workout)
        : [...(prev.preferredWorkouts || []), workout],
    }));
  };

  const handleNotificationChange = (type) => {
    setAccountInfo((prev) => ({
      ...prev,
      notificationPreferences: {
        ...(prev.notificationPreferences || {}),
        [type]: !prev.notificationPreferences?.[type],
      },
    }));
  };

  const handleDataSharingChange = (type) => {
    setAccountInfo((prev) => ({
      ...prev,
      dataSharing: {
        ...(prev.dataSharing || {}),
        [type]: !prev.dataSharing?.[type],
      },
    }));
  };

  const handleSave = async () => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      
      if (!userEmail) {
        setError("User not logged in");
        return;
      }

      // Transform our frontend data structure to the API expected format
      const userData = {
        name: `${personalInfo.firstName} ${personalInfo.lastName}`.trim(),
        phone: personalInfo.phoneNumber
      };
      
      const profileData = {
        gender: personalInfo.gender,
        birthday: personalInfo.birthdate,
        curr_height: personalInfo.height,
        curr_weight: personalInfo.currentWeight,
        goal_weight: personalInfo.goalWeight,
        fitness_level: fitnessInfo.fitnessLevel?.toUpperCase() || "BEGINNER",
        fitness_goals: fitnessInfo.fitnessGoals || [],
        profile_pic: personalInfo.profileImage
      };

      // Send the updated data to the API
      const response = await fetch(`http://localhost:3000/api/profile?email=${encodeURIComponent(userEmail)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          user: userData,
          profile: profileData
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      
      const result = await response.json();
      console.log("Update result:", result);
      
      // Update the user state with new data
      setUser(prev => ({
        ...prev,
        ...result.user
      }));
      
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    // Reset form to current user data
    const userData = user;
    const profileData = user.profile || {};
    
    // Transform back to frontend data structure
    setPersonalInfo({
      firstName: userData.name?.split(' ')[0] || '',
      lastName: userData.name?.split(' ')[1] || '',
      email: userData.email || '',
      phoneNumber: userData.phone || '',
      gender: profileData.gender || '',
      birthdate: profileData.birthday ? new Date(profileData.birthday).toISOString().split('T')[0] : '',
      height: profileData.height || '',
      currentWeight: profileData.curr_weight || '',
      goalWeight: profileData.goal_weight || '',
      profileImage: profileData.profile_pic || null
    });
    
    setEditMode(false);
  };

  const availableGoals = [
    "Weight Loss",
    "Muscle Gain",
    "Muscle Tone",
    "Endurance",
    "Flexibility",
    "Cardiovascular Health",
    "Sports Performance",
  ];

  const availableWorkouts = [
    "Running",
    "Cycling",
    "Swimming",
    "Weight Training",
    "HIIT",
    "Yoga",
    "Pilates",
    "CrossFit",
    "Calisthenics",
  ];

  if (loading) {
    return <div className="loading">Loading profile data...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!user) {
    return <div className="error-message">No profile data available</div>;
  }

  return (
    <div className="app-container">
      <div className="nav-wrapper">
        <Nav purchasedPlans={purchasedPlans} />
      </div>
      <div className="profile-page">
        <div className="profile-header">
          <div className="profile-image-container">
            <img 
              src={personalInfo.profileImage || ProfilePic} 
              alt="Profile" 
              className="profile-image" 
            />
            {editMode && (
              <button className="change-photo-btn">Change Photo</button>
            )}
          </div>
          <div className="profile-title">
            <h1>
              {personalInfo.firstName} {personalInfo.lastName}
            </h1>
            <p className="username">@{accountInfo.username}</p>
          </div>
          <div className="profile-actions">
            {!editMode ? (
              <button
                className="edit-profile-btn"
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button className="save-btn" onClick={handleSave}>
                  Save Changes
                </button>
                <button className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="profile-section personal-info">
          <h2>Personal Information</h2>
          <div className="section-content">
            {!editMode ? (
              <div className="info-grid">
                <div className="info-item">
                  <label>Email:</label>
                  <span>{personalInfo.email}</span>
                </div>
                <div className="info-item">
                  <label>Gender:</label>
                  <span>{personalInfo.gender || "Not specified"}</span>
                </div>
                <div className="info-item">
                  <label>Birthdate:</label>
                  <span>{personalInfo.birthdate || "Not specified"}</span>
                </div>
                <div className="info-item">
                  <label>Height:</label>
                  <span>{personalInfo.height || 0} cm</span>
                </div>
                <div className="info-item">
                  <label>Current Weight:</label>
                  <span>{personalInfo.currentWeight || 0} kg</span>
                </div>
                <div className="info-item">
                  <label>Goal Weight:</label>
                  <span>{personalInfo.goalWeight || 0} kg</span>
                </div>
                <div className="info-item">
                  <label>Phone Number:</label>
                  <span>{personalInfo.phoneNumber || "Not provided"}</span>
                </div>
              </div>
            ) : (
              <div className="edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={personalInfo.firstName || ""}
                      onChange={handlePersonalInfoChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={personalInfo.lastName || ""}
                      onChange={handlePersonalInfoChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={personalInfo.email || ""}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={personalInfo.phoneNumber || ""}
                      onChange={handlePersonalInfoChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="gender">Gender</label>
                    <select
                      id="gender"
                      name="gender"
                      value={personalInfo.gender || ""}
                      onChange={handlePersonalInfoChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="birthdate">Birthdate</label>
                    <input
                      type="date"
                      id="birthdate"
                      name="birthdate"
                      value={personalInfo.birthdate || ""}
                      onChange={handlePersonalInfoChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="height">Height (cm)</label>
                    <input
                      type="number"
                      id="height"
                      name="height"
                      value={personalInfo.height || ""}
                      onChange={handlePersonalInfoChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="currentWeight">Current Weight (kg)</label>
                    <input
                      type="number"
                      id="currentWeight"
                      name="currentWeight"
                      value={personalInfo.currentWeight || ""}
                      onChange={handlePersonalInfoChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="goalWeight">Goal Weight (kg)</label>
                    <input
                      type="number"
                      id="goalWeight"
                      name="goalWeight"
                      value={personalInfo.goalWeight || ""}
                      onChange={handlePersonalInfoChange}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fitness Information Section */}
        <div className="profile-section fitness-info">
          <h2>Fitness Information</h2>
          <div className="section-content">
            {!editMode ? (
              <div className="info-grid">
                <div className="info-item">
                  <label>Fitness Level:</label>
                  <span>{fitnessInfo.fitnessLevel || "Not specified"}</span>
                </div>
                <div className="info-item">
                  <label>Activity Level:</label>
                  <span>{fitnessInfo.activityLevel || "Not specified"}</span>
                </div>
                <div className="info-item">
                  <label>Workout Frequency:</label>
                  <span>{fitnessInfo.workoutFrequency || 0} times/week</span>
                </div>
                <div className="info-item col-span-2">
                  <label>Fitness Goals:</label>
                  <div className="tag-list">
                    {(fitnessInfo.fitnessGoals || []).map((goal, idx) => (
                      <span key={idx} className="tag">
                        {goal}
                      </span>
                    ))}
                    {(fitnessInfo.fitnessGoals || []).length === 0 && (
                      <span className="no-data">No goals set</span>
                    )}
                  </div>
                </div>
                <div className="info-item col-span-2">
                  <label>Preferred Workouts:</label>
                  <div className="tag-list">
                    {(fitnessInfo.preferredWorkouts || []).map((workout, idx) => (
                      <span key={idx} className="tag">
                        {workout}
                      </span>
                    ))}
                    {(fitnessInfo.preferredWorkouts || []).length === 0 && (
                      <span className="no-data">No preferred workouts set</span>
                    )}
                  </div>
                </div>
                <div className="info-item col-span-2">
                  <label>Medical Conditions:</label>
                  <span>
                    {(fitnessInfo.medicalConditions || []).length > 0
                      ? fitnessInfo.medicalConditions.join(", ")
                      : "None reported"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fitnessLevel">Fitness Level</label>
                    <select
                      id="fitnessLevel"
                      name="fitnessLevel"
                      value={fitnessInfo.fitnessLevel || ""}
                      onChange={(e) => setFitnessInfo({...fitnessInfo, fitnessLevel: e.target.value})}
                    >
                      <option value="">Select Fitness Level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="activityLevel">Activity Level</label>
                    <select
                      id="activityLevel"
                      name="activityLevel"
                      value={fitnessInfo.activityLevel || ""}
                      onChange={(e) => setFitnessInfo({...fitnessInfo, activityLevel: e.target.value})}
                    >
                      <option value="">Select Activity Level</option>
                      <option value="Sedentary">Sedentary</option>
                      <option value="Light">Light</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Active">Active</option>
                      <option value="Very Active">Very Active</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="workoutFrequency">Workout Frequency (per week)</label>
                    <input
                      type="number"
                      id="workoutFrequency"
                      name="workoutFrequency"
                      min="0"
                      max="7"
                      value={fitnessInfo.workoutFrequency || ""}
                      onChange={(e) => setFitnessInfo({...fitnessInfo, workoutFrequency: parseInt(e.target.value, 10)})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Fitness Goals</label>
                  <div className="checkbox-group">
                    {availableGoals.map((goal) => (
                      <div key={goal} className="checkbox-item">
                        <input
                          type="checkbox"
                          id={`goal-${goal}`}
                          checked={(fitnessInfo.fitnessGoals || []).includes(goal)}
                          onChange={() => handleGoalChange(goal)}
                        />
                        <label htmlFor={`goal-${goal}`}>{goal}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Preferred Workouts</label>
                  <div className="checkbox-group">
                    {availableWorkouts.map((workout) => (
                      <div key={workout} className="checkbox-item">
                        <input
                          type="checkbox"
                          id={`workout-${workout}`}
                          checked={(fitnessInfo.preferredWorkouts || []).includes(workout)}
                          onChange={() => handleWorkoutPreferenceChange(workout)}
                        />
                        <label htmlFor={`workout-${workout}`}>{workout}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="medicalConditions">Medical Conditions (comma separated)</label>
                  <textarea
                    id="medicalConditions"
                    name="medicalConditions"
                    value={(fitnessInfo.medicalConditions || []).join(", ")}
                    onChange={(e) => setFitnessInfo({...fitnessInfo, medicalConditions: e.target.value.split(", ").filter(condition => condition.trim())})}
                    rows="3"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Information Section */}
        <div className="profile-section account-info">
          <h2>Account Information</h2>
          <div className="section-content">
            <div className="info-grid">
              <div className="info-item">
                <label>Username:</label>
                <span>{accountInfo.username}</span>
              </div>
              <div className="info-item">
                <label>Member Since:</label>
                <span>{accountInfo.memberSince}</span>
              </div>
              <div className="info-item">
                <label>Subscription:</label>
                <span>{accountInfo.subscription}</span>
              </div>
              <div className="info-item">
                <label>Renewal Date:</label>
                <span>{accountInfo.subscriptionRenewal || "N/A"}</span>
              </div>
              
              {!editMode ? (
                <>
                  <div className="info-item col-span-2">
                    <label>Notification Preferences:</label>
                    <div className="preferences-list">
                      <span className={`preference ${accountInfo.notificationPreferences?.email ? 'active' : 'inactive'}`}>
                        Email: {accountInfo.notificationPreferences?.email ? "On" : "Off"}
                      </span>
                      <span className={`preference ${accountInfo.notificationPreferences?.push ? 'active' : 'inactive'}`}>
                        Push: {accountInfo.notificationPreferences?.push ? "On" : "Off"}
                      </span>
                      <span className={`preference ${accountInfo.notificationPreferences?.sms ? 'active' : 'inactive'}`}>
                        SMS: {accountInfo.notificationPreferences?.sms ? "On" : "Off"}
                      </span>
                    </div>
                  </div>
                  <div className="info-item col-span-2">
                    <label>Data Sharing:</label>
                    <div className="preferences-list">
                      <span className={`preference ${accountInfo.dataSharing?.anonymizedResearch ? 'active' : 'inactive'}`}>
                        Research: {accountInfo.dataSharing?.anonymizedResearch ? "On" : "Off"}
                      </span>
                      <span className={`preference ${accountInfo.dataSharing?.thirdPartyApps ? 'active' : 'inactive'}`}>
                        Third-party Apps: {accountInfo.dataSharing?.thirdPartyApps ? "On" : "Off"}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="info-item col-span-2">
                    <label>Notification Preferences:</label>
                    <div className="toggle-group">
                      <div className="toggle-item">
                        <label htmlFor="email-notifications">Email Notifications</label>
                        <div className="toggle-switch">
                          <input
                            type="checkbox"
                            id="email-notifications"
                            checked={accountInfo.notificationPreferences?.email || false}
                            onChange={() => handleNotificationChange('email')}
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </div>
                      <div className="toggle-item">
                        <label htmlFor="push-notifications">Push Notifications</label>
                        <div className="toggle-switch">
                          <input
                            type="checkbox"
                            id="push-notifications"
                            checked={accountInfo.notificationPreferences?.push || false}
                            onChange={() => handleNotificationChange('push')}
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </div>
                      <div className="toggle-item">
                        <label htmlFor="sms-notifications">SMS Notifications</label>
                        <div className="toggle-switch">
                          <input
                            type="checkbox"
                            id="sms-notifications"
                            checked={accountInfo.notificationPreferences?.sms || false}
                            onChange={() => handleNotificationChange('sms')}
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="info-item col-span-2">
                    <label>Data Sharing:</label>
                    <div className="toggle-group">
                      <div className="toggle-item">
                        <label htmlFor="research-sharing">Anonymized Research</label>
                        <div className="toggle-switch">
                          <input
                            type="checkbox"
                            id="research-sharing"
                            checked={accountInfo.dataSharing?.anonymizedResearch || false}
                            onChange={() => handleDataSharingChange('anonymizedResearch')}
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </div>
                      <div className="toggle-item">
                        <label htmlFor="third-party-sharing">Third-party App Integration</label>
                        <div className="toggle-switch">
                          <input
                            type="checkbox"
                            id="third-party-sharing"
                            checked={accountInfo.dataSharing?.thirdPartyApps || false}
                            onChange={() => handleDataSharingChange('thirdPartyApps')}
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Fitness Statistics Section */}
        <div className="profile-section fitness-stats">
          <h2>Fitness Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{user.statistics?.totalWorkouts || 0}</div>
              <div className="stat-label">Total Workouts</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {Math.floor((user.statistics?.totalDuration || 0) / 60)}
              </div>
              <div className="stat-label">Total Hours</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {user.statistics?.averageWorkoutLength || 0}
              </div>
              <div className="stat-label">Avg. Workout (min)</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{user.statistics?.longestStreak || 0}</div>
              <div className="stat-label">Longest Streak</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{user.statistics?.currentStreak || 0}</div>
              <div className="stat-label">Current Streak</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {((user.statistics?.caloriesBurned || 0) / 1000).toFixed(1)}k
              </div>
              <div className="stat-label">Calories Burned</div>
            </div>
          </div>

          <div className="favorite-exercise">
            <h3>Favorite Exercise</h3>
            <p>{user.statistics?.favoriteExercise || "N/A"}</p>
          </div>
        </div>

        {/* Purchased Plans Section */}
        {purchasedPlans && purchasedPlans.length > 0 && (
          <div className="profile-section purchased-plans">
            <h2>Purchased Plans</h2>
            <div className="plans-list">
              {purchasedPlans.map((plan, index) => (
                <div key={index} className="plan-card">
                  <h3>{plan.name}</h3>
                  <p>{plan.description}</p>
                  <div className="plan-details">
                    <span>Purchase Date: {new Date(plan.purchaseDate).toLocaleDateString()}</span>
                    <span>Expires: {new Date(plan.expiryDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;