/* Last Name, First Name - Student ID */
/* 
 Suresh, Kaushick ( 1002237680 ), 
 Sivaprakash, Akshay Prassanna ( 1002198274 ) ,  
 Sonwane, Pratik ( 1002170610 ) , 
 Shaik, Arfan ( 1002260039 ) , 
 Sheth, Jeet ( 1002175315 ) 
*/
import React, { useState, useEffect } from "react";
import Nav from "./Nav";
import "../styles/Profile.css";
import ProfilePic from "../assets/profilepic.jpg";
const Profile = () => {
  const defaultUser = {
    personalInfo: {
      firstName: "Alex",
      lastName: "John",
      email: "alex.johnson@example.com",
      gender: "Male",
      birthdate: "1990-05-15",
      height: 175,
      currentWeight: 70,
      goalWeight: 65,
      phoneNumber: "(123) 456-7890",
      profileImage: "/api/placeholder/150/150",
    },
    fitnessInfo: {
      fitnessLevel: "Intermediate",
      activityLevel: "Moderate",
      workoutFrequency: 4,
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
      totalDuration: 5220,
      averageWorkoutLength: 60,
      longestStreak: 14,
      currentStreak: 3,
      caloriesBurned: 42500,
      favoriteExercise: "Squats",
    },
  };
  const userData = {};
  const user = defaultUser || userData;

  // State setup with safe defaults
  const [editMode, setEditMode] = useState(false);
  const [personalInfo, setPersonalInfo] = useState(user.personalInfo ?? {});
  const [fitnessInfo, setFitnessInfo] = useState({
    fitnessLevel: user.fitnessInfo?.fitnessLevel || "",
    activityLevel: user.fitnessInfo?.activityLevel || "",
    workoutFrequency: user.fitnessInfo?.workoutFrequency || 0,
    fitnessGoals: user.fitnessInfo?.fitnessGoals || [],
    preferredWorkouts: user.fitnessInfo?.preferredWorkouts || [],
    medicalConditions: user.fitnessInfo?.medicalConditions || [],
    startDate: user.fitnessInfo?.startDate || "",
  });
  const [accountInfo, setAccountInfo] = useState(user.accountInfo ?? {});
  const [purchasedPlans, setPurchasedPlans] = useState(() => {
    const savedPlans = localStorage.getItem("purchasedPlans");
    return savedPlans ? JSON.parse(savedPlans) : [];
  });

  useEffect(() => {
    localStorage.setItem("purchasedPlans", JSON.stringify(purchasedPlans));
  }, [purchasedPlans]);

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoalChange = (goal) => {
    setFitnessInfo((prev) => ({
      ...prev,
      fitnessGoals: prev.fitnessGoals.includes(goal)
        ? prev.fitnessGoals.filter((g) => g !== goal)
        : [...prev.fitnessGoals, goal],
    }));
  };

  const handleWorkoutPreferenceChange = (workout) => {
    setFitnessInfo((prev) => ({
      ...prev,
      preferredWorkouts: prev.preferredWorkouts.includes(workout)
        ? prev.preferredWorkouts.filter((w) => w !== workout)
        : [...prev.preferredWorkouts, workout],
    }));
  };

  const handleNotificationChange = (type) => {
    setAccountInfo((prev) => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [type]: !prev.notificationPreferences?.[type],
      },
    }));
  };

  const handleDataSharingChange = (type) => {
    setAccountInfo((prev) => ({
      ...prev,
      dataSharing: {
        ...prev.dataSharing,
        [type]: !prev.dataSharing?.[type],
      },
    }));
  };

  const handleSave = () => {
    setEditMode(false);
  };

  const handleCancel = () => {
    setPersonalInfo(user.personalInfo);
    setFitnessInfo(user.fitnessInfo);
    setAccountInfo(user.accountInfo);
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

  return (
    <div className="app-container">
      <div className="nav-wrapper">
        <Nav purchasedPlans={purchasedPlans} />
      </div>
      <div className="profile-page">
        <div className="profile-header">
          <div className="profile-image-container">
            <img src={ProfilePic} alt="Profile" className="profile-image" />
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

        {/* ✅ Use safe access with optional chaining and fallback arrays */}
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
                  <span>{fitnessInfo.workoutFrequency} times/week</span>
                </div>
                <div className="info-item col-span-2">
                  <label>Fitness Goals:</label>
                  <div className="tag-list">
                    {(fitnessInfo.fitnessGoals || []).map((goal, idx) => (
                      <span key={idx} className="tag">
                        {goal}
                      </span>
                    ))}
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
              // edit form not shown for brevity
              <p>Edit mode form goes here...</p>
            )}
          </div>
        </div>

        <div className="profile-section fitness-stats">
          <h2>Fitness Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{user.statistics?.totalWorkouts}</div>
              <div className="stat-label">Total Workouts</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {Math.floor((user.statistics?.totalDuration ?? 0) / 60)}
              </div>
              <div className="stat-label">Total Hours</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {user.statistics?.averageWorkoutLength}
              </div>
              <div className="stat-label">Avg. Workout (min)</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{user.statistics?.longestStreak}</div>
              <div className="stat-label">Longest Streak</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{user.statistics?.currentStreak}</div>
              <div className="stat-label">Current Streak</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {(user.statistics?.caloriesBurned / 1000 || 0).toFixed(1)}k
              </div>
              <div className="stat-label">Calories Burned</div>
            </div>
          </div>

          <div className="favorite-exercise">
            <h3>Favorite Exercise</h3>
            <p>{user.statistics?.favoriteExercise || "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
