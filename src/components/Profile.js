import React, {useState, useEffect} from "react";
import Nav from "./Nav";
import "../styles/Profile.css";
import ProfilePic from '../assets/profilepic.jpg';
const Profile = () => {
  const defaultUser = {
    personalInfo: {
      firstName: "Alex",
      lastName: "John",
      email: "alex.johnson@example.com",
      gender: "Male",
      birthdate: "1990-05-15",
      height: 175, // in cm
      currentWeight: 70, // in kg
      goalWeight: 65, // in kg
      phoneNumber: "(123) 456-7890",
      profileImage: "/api/placeholder/150/150",
    },
    fitnessInfo: {
      fitnessLevel: "Intermediate",
      activityLevel: "Moderate",
      workoutFrequency: 4, // times per week
      fitnessGoals: ["Weight Loss", "Muscle Tone", "Endurance"],
      preferredWorkouts: ["Running", "Weight Training", "Yoga"],
      medicalConditions: [],
      startDate: "2023-10-01",
    },
    accountInfo: {
      username: "alexfit90",
      memberSince: "2023-10-01",
      subscription: "Premium",
      subscriptionRenewal: "2025-10-01",
      notificationPreferences: {
        email: true,
        push: true,
        sms: false,
      },
      dataSharing: {
        anonymizedResearch: true,
        thirdPartyApps: false,
      },
    },
    statistics: {
      totalWorkouts: 87,
      totalDuration: 5220, // minutes
      averageWorkoutLength: 60, // minutes
      longestStreak: 14, // days
      currentStreak: 3, // days
      caloriesBurned: 42500,
      favoriteExercise: "Squats",
    },
  };
  const userData= {};
  const user = defaultUser || userData;

  // State for editable user information
  const [editMode, setEditMode] = useState(false);
  const [personalInfo, setPersonalInfo] = useState(user.personalInfo);
  const [fitnessInfo, setFitnessInfo] = useState(user.fitnessInfo);
  const [accountInfo, setAccountInfo] = useState(user.accountInfo);
  const [purchasedPlans, setPurchasedPlans] = useState(() => {
    const savedPlans = localStorage.getItem('purchasedPlans');
    return savedPlans ? JSON.parse(savedPlans) : [];
  });
  
  useEffect(() => {
    localStorage.setItem('purchasedPlans', JSON.stringify(purchasedPlans));
  }, [purchasedPlans]);
  // Function to handle input changes for personal info
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo({
      ...personalInfo,
      [name]: value,
    });
  };

  // Function to handle fitness goal checkbox changes
  const handleGoalChange = (goal) => {
    if (fitnessInfo.fitnessGoals.includes(goal)) {
      setFitnessInfo({
        ...fitnessInfo,
        fitnessGoals: fitnessInfo.fitnessGoals.filter((g) => g !== goal),
      });
    } else {
      setFitnessInfo({
        ...fitnessInfo,
        fitnessGoals: [...fitnessInfo.fitnessGoals, goal],
      });
    }
  };

  // Function to handle preferred workout checkbox changes
  const handleWorkoutPreferenceChange = (workout) => {
    if (fitnessInfo.preferredWorkouts.includes(workout)) {
      setFitnessInfo({
        ...fitnessInfo,
        preferredWorkouts: fitnessInfo.preferredWorkouts.filter(
          (w) => w !== workout
        ),
      });
    } else {
      setFitnessInfo({
        ...fitnessInfo,
        preferredWorkouts: [...fitnessInfo.preferredWorkouts, workout],
      });
    }
  };

  // Function to handle notification preference changes
  const handleNotificationChange = (type) => {
    setAccountInfo({
      ...accountInfo,
      notificationPreferences: {
        ...accountInfo.notificationPreferences,
        [type]: !accountInfo.notificationPreferences[type],
      },
    });
  };

  // Function to handle data sharing preference changes
  const handleDataSharingChange = (type) => {
    setAccountInfo({
      ...accountInfo,
      dataSharing: {
        ...accountInfo.dataSharing,
        [type]: !accountInfo.dataSharing[type],
      },
    });
  };

  // Function to save changes
  const handleSave = () => {
    // Here you would typically make an API call to update user data
    // For now, we'll just toggle edit mode off
    setEditMode(false);

    // In a real app, you might do something like:
    // updateUserProfile({personalInfo, fitnessInfo, accountInfo})
    //   .then(() => setEditMode(false))
    //   .catch(error => console.error('Error updating profile:', error));
  };

  // Function to cancel editing
  const handleCancel = () => {
    // Reset to original values
    setPersonalInfo(user.personalInfo);
    setFitnessInfo(user.fitnessInfo);
    setAccountInfo(user.accountInfo);
    setEditMode(false);
  };

  // Available fitness goals for selection
  const availableGoals = [
    "Weight Loss",
    "Muscle Gain",
    "Muscle Tone",
    "Endurance",
    "Flexibility",
    "Cardiovascular Health",
    "Sports Performance",
  ];

  // Available workout types for selection
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

  return (
    <>
      <div className="app-container">
        <div className="nav-wrapper">
          <Nav purchasedPlans={purchasedPlans} />
        </div>
        <div className="profile-page">
          <div className="profile-header">
            <div className="profile-image-container">
              <img
                src={ProfilePic}
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

          <div className="profile-content">
            <div className="profile-section personal-info">
              <h2>Personal Information</h2>
              <div className="section-content">
                {!editMode ? (
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Name:</label>
                      <span>
                        {personalInfo.firstName} {personalInfo.lastName}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Email:</label>
                      <span>{personalInfo.email}</span>
                    </div>
                    <div className="info-item">
                      <label>Gender:</label>
                      <span>{personalInfo.gender}</span>
                    </div>
                    <div className="info-item">
                      <label>Birthdate:</label>
                      <span>
                        {new Date(personalInfo.birthdate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Height:</label>
                      <span>{personalInfo.height} cm</span>
                    </div>
                    <div className="info-item">
                      <label>Current Weight:</label>
                      <span>{personalInfo.currentWeight} kg</span>
                    </div>
                    <div className="info-item">
                      <label>Goal Weight:</label>
                      <span>{personalInfo.goalWeight} kg</span>
                    </div>
                    <div className="info-item">
                      <label>Phone:</label>
                      <span>{personalInfo.phoneNumber}</span>
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
                          value={personalInfo.firstName}
                          onChange={handlePersonalInfoChange}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={personalInfo.lastName}
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
                          value={personalInfo.email}
                          onChange={handlePersonalInfoChange}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="phoneNumber">Phone</label>
                        <input
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          value={personalInfo.phoneNumber}
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
                          value={personalInfo.gender}
                          onChange={handlePersonalInfoChange}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Non-binary">Non-binary</option>
                          <option value="Prefer not to say">
                            Prefer not to say
                          </option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="birthdate">Birthdate</label>
                        <input
                          type="date"
                          id="birthdate"
                          name="birthdate"
                          value={personalInfo.birthdate}
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
                          value={personalInfo.height}
                          onChange={handlePersonalInfoChange}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="currentWeight">
                          Current Weight (kg)
                        </label>
                        <input
                          type="number"
                          id="currentWeight"
                          name="currentWeight"
                          value={personalInfo.currentWeight}
                          onChange={handlePersonalInfoChange}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="goalWeight">Goal Weight (kg)</label>
                        <input
                          type="number"
                          id="goalWeight"
                          name="goalWeight"
                          value={personalInfo.goalWeight}
                          onChange={handlePersonalInfoChange}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-section fitness-info">
              <h2>Fitness Information</h2>
              <div className="section-content">
                {!editMode ? (
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Fitness Level:</label>
                      <span>{fitnessInfo.fitnessLevel}</span>
                    </div>
                    <div className="info-item">
                      <label>Activity Level:</label>
                      <span>{fitnessInfo.activityLevel}</span>
                    </div>
                    <div className="info-item">
                      <label>Workout Frequency:</label>
                      <span>{fitnessInfo.workoutFrequency} times per week</span>
                    </div>
                    <div className="info-item col-span-2">
                      <label>Fitness Goals:</label>
                      <div className="tag-list">
                        {fitnessInfo.fitnessGoals.map((goal, index) => (
                          <span key={index} className="tag">
                            {goal}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="info-item col-span-2">
                      <label>Preferred Workouts:</label>
                      <div className="tag-list">
                        {fitnessInfo.preferredWorkouts.map((workout, index) => (
                          <span key={index} className="tag">
                            {workout}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="info-item col-span-2">
                      <label>Medical Conditions:</label>
                      <span>
                        {fitnessInfo.medicalConditions.length > 0
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
                          value={fitnessInfo.fitnessLevel}
                          onChange={(e) =>
                            setFitnessInfo({
                              ...fitnessInfo,
                              fitnessLevel: e.target.value,
                            })
                          }
                        >
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
                          value={fitnessInfo.activityLevel}
                          onChange={(e) =>
                            setFitnessInfo({
                              ...fitnessInfo,
                              activityLevel: e.target.value,
                            })
                          }
                        >
                          <option value="Sedentary">Sedentary</option>
                          <option value="Light">Light</option>
                          <option value="Moderate">Moderate</option>
                          <option value="Active">Active</option>
                          <option value="Very Active">Very Active</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="workoutFrequency">
                          Workout Frequency (per week)
                        </label>
                        <input
                          type="number"
                          id="workoutFrequency"
                          name="workoutFrequency"
                          min="0"
                          max="7"
                          value={fitnessInfo.workoutFrequency}
                          onChange={(e) =>
                            setFitnessInfo({
                              ...fitnessInfo,
                              workoutFrequency: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Fitness Goals</label>
                      <div className="checkbox-group">
                        {availableGoals.map((goal, index) => (
                          <div key={index} className="checkbox-item">
                            <input
                              type="checkbox"
                              id={`goal-${index}`}
                              checked={fitnessInfo.fitnessGoals.includes(goal)}
                              onChange={() => handleGoalChange(goal)}
                            />
                            <label htmlFor={`goal-${index}`}>{goal}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Preferred Workouts</label>
                      <div className="checkbox-group">
                        {availableWorkouts.map((workout, index) => (
                          <div key={index} className="checkbox-item">
                            <input
                              type="checkbox"
                              id={`workout-${index}`}
                              checked={fitnessInfo.preferredWorkouts.includes(
                                workout
                              )}
                              onChange={() =>
                                handleWorkoutPreferenceChange(workout)
                              }
                            />
                            <label htmlFor={`workout-${index}`}>
                              {workout}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="medicalConditions">
                        Medical Conditions (comma separated)
                      </label>
                      <textarea
                        id="medicalConditions"
                        name="medicalConditions"
                        value={fitnessInfo.medicalConditions.join(", ")}
                        onChange={(e) =>
                          setFitnessInfo({
                            ...fitnessInfo,
                            medicalConditions: e.target.value
                              .split(",")
                              .map((item) => item.trim())
                              .filter((item) => item !== ""),
                          })
                        }
                        placeholder="List any medical conditions that may affect your fitness routine"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-section account-settings">
              <h2>Account Settings</h2>
              <div className="section-content">
                {!editMode ? (
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Username:</label>
                      <span>{accountInfo.username}</span>
                    </div>
                    <div className="info-item">
                      <label>Subscription:</label>
                      <span>{accountInfo.subscription}</span>
                    </div>
                    <div className="info-item">
                      <label>Renewal Date:</label>
                      <span>
                        {new Date(
                          accountInfo.subscriptionRenewal
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="info-item col-span-2">
                      <label>Notification Preferences:</label>
                      <div className="preference-list">
                        <div className="preference-item">
                          <span>Email</span>
                          <span
                            className={`status-indicator ${
                              accountInfo.notificationPreferences.email
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {accountInfo.notificationPreferences.email
                              ? "On"
                              : "Off"}
                          </span>
                        </div>
                        <div className="preference-item">
                          <span>Push</span>
                          <span
                            className={`status-indicator ${
                              accountInfo.notificationPreferences.push
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {accountInfo.notificationPreferences.push
                              ? "On"
                              : "Off"}
                          </span>
                        </div>
                        <div className="preference-item">
                          <span>SMS</span>
                          <span
                            className={`status-indicator ${
                              accountInfo.notificationPreferences.sms
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {accountInfo.notificationPreferences.sms
                              ? "On"
                              : "Off"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="info-item col-span-2">
                      <label>Data Sharing:</label>
                      <div className="preference-list">
                        <div className="preference-item">
                          <span>Anonymized Research</span>
                          <span
                            className={`status-indicator ${
                              accountInfo.dataSharing.anonymizedResearch
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {accountInfo.dataSharing.anonymizedResearch
                              ? "On"
                              : "Off"}
                          </span>
                        </div>
                        <div className="preference-item">
                          <span>Third-Party Apps</span>
                          <span
                            className={`status-indicator ${
                              accountInfo.dataSharing.thirdPartyApps
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {accountInfo.dataSharing.thirdPartyApps
                              ? "On"
                              : "Off"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="edit-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={accountInfo.username}
                          onChange={(e) =>
                            setAccountInfo({
                              ...accountInfo,
                              username: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Notification Preferences</label>
                      <div className="toggle-group">
                        <div className="toggle-item">
                          <label htmlFor="emailNotification">
                            Email Notifications
                          </label>
                          <div className="toggle-switch">
                            <input
                              type="checkbox"
                              id="emailNotification"
                              checked={
                                accountInfo.notificationPreferences.email
                              }
                              onChange={() => handleNotificationChange("email")}
                            />
                            <span className="toggle-slider"></span>
                          </div>
                        </div>
                        <div className="toggle-item">
                          <label htmlFor="pushNotification">
                            Push Notifications
                          </label>
                          <div className="toggle-switch">
                            <input
                              type="checkbox"
                              id="pushNotification"
                              checked={accountInfo.notificationPreferences.push}
                              onChange={() => handleNotificationChange("push")}
                            />
                            <span className="toggle-slider"></span>
                          </div>
                        </div>
                        <div className="toggle-item">
                          <label htmlFor="smsNotification">
                            SMS Notifications
                          </label>
                          <div className="toggle-switch">
                            <input
                              type="checkbox"
                              id="smsNotification"
                              checked={accountInfo.notificationPreferences.sms}
                              onChange={() => handleNotificationChange("sms")}
                            />
                            <span className="toggle-slider"></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Data Sharing Preferences</label>
                      <div className="toggle-group">
                        <div className="toggle-item">
                          <label htmlFor="researchSharing">
                            Share Anonymous Data for Research
                          </label>
                          <div className="toggle-switch">
                            <input
                              type="checkbox"
                              id="researchSharing"
                              checked={
                                accountInfo.dataSharing.anonymizedResearch
                              }
                              onChange={() =>
                                handleDataSharingChange("anonymizedResearch")
                              }
                            />
                            <span className="toggle-slider"></span>
                          </div>
                        </div>
                        <div className="toggle-item">
                          <label htmlFor="thirdPartySharing">
                            Share Data with Third-Party Apps
                          </label>
                          <div className="toggle-switch">
                            <input
                              type="checkbox"
                              id="thirdPartySharing"
                              checked={accountInfo.dataSharing.thirdPartyApps}
                              onChange={() =>
                                handleDataSharingChange("thirdPartyApps")
                              }
                            />
                            <span className="toggle-slider"></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="form-group mt-4">
                      <button className="password-reset-btn">
                        Change Password
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-section fitness-stats">
              <h2>Fitness Statistics</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">
                    {user.statistics.totalWorkouts}
                  </div>
                  <div className="stat-label">Total Workouts</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {Math.floor(user.statistics.totalDuration / 60)}
                  </div>
                  <div className="stat-label">Total Hours</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {user.statistics.averageWorkoutLength}
                  </div>
                  <div className="stat-label">Avg. Workout (min)</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {user.statistics.longestStreak}
                  </div>
                  <div className="stat-label">Longest Streak</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {user.statistics.currentStreak}
                  </div>
                  <div className="stat-label">Current Streak</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {(user.statistics.caloriesBurned / 1000).toFixed(1)}k
                  </div>
                  <div className="stat-label">Calories Burned</div>
                </div>
              </div>

              <div className="favorite-exercise">
                <h3>Favorite Exercise</h3>
                <p>{user.statistics.favoriteExercise}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Profile;
