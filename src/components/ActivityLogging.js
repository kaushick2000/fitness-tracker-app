import React, { useEffect, useState } from 'react';
import exercises from "../data/exercises_with_youtube.json";
import './ui/ActivityLogging.css';

const initialExerciseData = {
  "exercises_by_body_part": {
    "Abdominals": [
      {
        "title": "Partner plank band row",
        "description": "The partner plank band row is an abdominal exercise where two partners perform single-arm planks while pulling on the opposite ends of an exercise band. This technique can be done for time or reps in any ab-focused workout.",
        "type": "Strength",
        "equipment": "Bands",
        "level": "Intermediate",
        "rating": 0.0,
        "youtube_video": "https://www.youtube.com/watch?v=2dAndIUJ-68"
      },
      {
        "title": "Banded crunch isometric hold",
        "description": "The banded crunch isometric hold is an exercise targeting the abdominal muscles, particularly the rectus abdominis or \"six-pack\" muscles. The band adds resistance and continuous tension to this popular exercise.",
        "type": "Strength",
        "equipment": "Bands",
        "level": "Intermediate",
        "rating": 0,
        "youtube_video": "https://www.youtube.com/watch?v=WL65_NRRh8Y"
      }
    ],
    "Chest": [
      {
        "title": "Push-ups",
        "description": "A classic bodyweight exercise that targets the chest, shoulders, and triceps.",
        "type": "Strength",
        "equipment": "None",
        "level": "Beginner",
        "rating": 4.8,
        "youtube_video": "https://www.youtube.com/watch?v=IODxDxX7oi4"
      },
      {
        "title": "Bench Press",
        "description": "A compound exercise that targets the chest, shoulders, and triceps using a barbell or dumbbells.",
        "type": "Strength",
        "equipment": "Barbell/Dumbbells",
        "level": "Intermediate",
        "rating": 4.9,
        "youtube_video": "https://www.youtube.com/watch?v=vcBig73ojpE"
      }
    ],
    "Back": [
      {
        "title": "Dumbbell Flyes",
        "description": "An isolation exercise that targets the chest muscles using dumbbells.",
        "type": "Strength",
        "equipment": "Dumbbells",
        "level": "Intermediate",
        "rating": 4.5,
        "youtube_video": "https://www.youtube.com/watch?v=eozdVDA78K0"
      }
    ]
  }
};

const ActivityLogging = () => {
  // State declarations first
  const [exerciseData, setExerciseData] = useState(initialExerciseData);
  const [selectedBodyPart, setSelectedBodyPart] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [workoutHistory, setWorkoutHistory] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewHistory, setViewHistory] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [stepsCount, setStepsCount] = useState(0);
  const [activeMinutes, setActiveMinutes] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [userProfile, setUserProfile] = useState({
    name: "User",
    age: 30,
    weight: 70, // kg
    height: 175, // cm
    fitnessGoals: "Build muscle",
    weeklyTarget: {
      workouts: 4,
      steps: 70000,
      activeMinutes: 150
    }
  });
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  // Functions defined after state declarations
  
  // AI recommendation system
  const getRecommendedExercises = () => {
    // Analyze workout history to find patterns
    const bodyPartFrequency = {};
    const exerciseTypeFrequency = {};
    const recentExercises = [];
    
    // Count frequency of body parts and exercise types in history
    Object.values(workoutHistory).forEach(dayPlan => {
      dayPlan.forEach(exercise => {
        bodyPartFrequency[exercise.bodyPart] = (bodyPartFrequency[exercise.bodyPart] || 0) + 1;
        exerciseTypeFrequency[exercise.type] = (exerciseTypeFrequency[exercise.type] || 0) + 1;
        
        // Collect recent exercises to avoid recommending the same ones
        const exerciseDate = new Date(exercise.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        if (exerciseDate > weekAgo) {
          recentExercises.push(exercise.title);
        }
      });
    });
    
    // Find least worked body parts
    const sortedBodyParts = Object.entries(bodyPartFrequency)
      .sort((a, b) => a[1] - b[1])
      .map(entry => entry[0]);
    
    // Find preferred exercise types
    const preferredTypes = Object.entries(exerciseTypeFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
    
    // Based on user's fitness goals, recommend appropriate exercises
    const recommendations = [];
    
    // Get all available exercises
    const allExercises = [];
    Object.entries(exerciseData.exercises_by_body_part).forEach(([bodyPart, exercises]) => {
      exercises.forEach(exercise => {
        allExercises.push({...exercise, bodyPart});
      });
    });
    
    // Prioritize under-worked body parts
    const underworkedBodyParts = sortedBodyParts.slice(0, 2);
    
    // Filter exercises by user goals and level
    let goalMatch;
    switch(userProfile.fitnessGoals.toLowerCase()) {
      case "build muscle":
        goalMatch = "Strength";
        break;
      case "lose weight":
        goalMatch = "Cardio";
        break;
      case "improve flexibility":
        goalMatch = "Flexibility";
        break;
      default:
        goalMatch = preferredTypes[0] || "Strength";
    }
    
    // Find exercises that match criteria
    allExercises.forEach(exercise => {
      // Skip recently done exercises
      if (recentExercises.includes(exercise.title)) {
        return;
      }
      
      let score = 0;
      
      // Higher score for underworked body parts
      if (underworkedBodyParts.includes(exercise.bodyPart)) {
        score += 3;
      }
      
      // Higher score for preferred types
      if (exercise.type === goalMatch) {
        score += 2;
      }
      
      // Higher score for appropriate level
      const userLevel = "Intermediate"; // This could be calculated from user profile
      if (exercise.level === userLevel) {
        score += 1;
      }
      
      // Add to recommendations with score
      recommendations.push({...exercise, score});
    });
    
    // Sort by score and take top 5
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  };

  const handleAddExercise = (exercise, bodyPart) => {
    // Calculate more realistic calories based on exercise type and user profile
    const intensityFactors = {
      "Strength": 0.08,
      "Cardio": 0.12,
      "Flexibility": 0.05
    };
    
    const intensityFactor = intensityFactors[exercise.type] || 0.08;
    const userWeight = userProfile.weight;
    
    // More realistic formula: weight * intensity factor * duration
    const duration = 15;
    const calories = Math.round(userWeight * intensityFactor * duration);
    
    if (editingExercise) {
      // Update existing exercise
      const updatedWorkoutPlan = workoutPlan.map(ex => 
        ex.id === editingExercise.id 
          ? {...exercise, id: ex.id, bodyPart, duration, calories, reps: 12, date: selectedDate} 
          : ex
      );
      setWorkoutPlan(updatedWorkoutPlan);
      setEditingExercise(null);
    } else {
      // Add new exercise
      const newExercise = {
        ...exercise,
        id: Date.now(),
        bodyPart,
        duration,
        calories,
        reps: 12,
        date: selectedDate
      };
      
      setWorkoutPlan([...workoutPlan, newExercise]);
    }
  };

  const handleRemoveExercise = (id) => {
    if (window.confirm("Are you sure you want to remove this exercise?")) {
      setWorkoutPlan(workoutPlan.filter(exercise => exercise.id !== id));
    }
  };
  
  const handleEditExercise = (exercise) => {
    setEditingExercise(exercise);
    setSelectedBodyPart(exercise.bodyPart);
    
    // Scroll to exercise selection
    document.querySelector('.exercise-list-container').scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSaveWorkout = () => {
    const updatedHistory = {...workoutHistory};
    updatedHistory[selectedDate] = [...workoutPlan];
    
    setWorkoutHistory(updatedHistory);
    alert("Workout saved successfully!");
  };
  
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    
    // Load workout for selected date if it exists
    if (workoutHistory[newDate]) {
      setWorkoutPlan([...workoutHistory[newDate]]);
    } else {
      setWorkoutPlan([]);
    }
  };
  
  const handleAddSteps = (e) => {
    e.preventDefault();
    const steps = parseInt(e.target.steps.value) || 0;
    setStepsCount(stepsCount + steps);
    
    // Update total calories based on steps (rough estimate)
    const caloriesPerStep = 0.04;
    const newCalories = Math.round(steps * caloriesPerStep);
    setCaloriesBurned(caloriesBurned + newCalories);
    
    // Clear form
    e.target.steps.value = '';
  };
  
  const handleAddActiveMinutes = (e) => {
    e.preventDefault();
    const minutes = parseInt(e.target.minutes.value) || 0;
    setActiveMinutes(activeMinutes + minutes);
    
    // Update total calories based on active minutes (rough estimate)
    const caloriesPerMinute = 4;
    const newCalories = minutes * caloriesPerMinute;
    setCaloriesBurned(caloriesBurned + newCalories);
    
    // Clear form
    e.target.minutes.value = '';
  };
  
  const handleExportData = () => {
    const dataToExport = {
      profile: userProfile,
      history: workoutHistory,
      currentPlan: workoutPlan
    };
    
    const dataStr = JSON.stringify(dataToExport);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'fitness_data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        
        if (importedData.profile) setUserProfile(importedData.profile);
        if (importedData.history) setWorkoutHistory(importedData.history);
        if (importedData.currentPlan) setWorkoutPlan(importedData.currentPlan);
        
        alert("Data imported successfully!");
      } catch (error) {
        alert("Error importing data. Please check the file format.");
        console.error("Import error:", error);
      }
    };
    
    reader.readAsText(file);
  };

  // Filter exercises based on search query and selected body part
  const filteredExercises = () => {
    const bodyParts = Object.keys(exerciseData.exercises_by_body_part);
    
    if (searchQuery) {
      const results = {};
      
      bodyParts.forEach(bodyPart => {
        const matchingExercises = exerciseData.exercises_by_body_part[bodyPart].filter(
          exercise => exercise.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        if (matchingExercises.length > 0) {
          results[bodyPart] = matchingExercises;
        }
      });
      
      return results;
    }
    
    if (selectedBodyPart) {
      return {
        [selectedBodyPart]: exerciseData.exercises_by_body_part[selectedBodyPart] || []
      };
    }
    
    return exerciseData.exercises_by_body_part;
  };
  
  // Effects last, after state and functions
  useEffect(() => {
    if (exercises !== undefined) {
      setExerciseData(exercises);
    }
    
    // Load saved data from localStorage on component mount
    const savedWorkouts = localStorage.getItem('workoutHistory');
    if (savedWorkouts) {
      setWorkoutHistory(JSON.parse(savedWorkouts));
    }
    
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
    
    // Load workout for today if it exists
    const today = new Date().toISOString().split('T')[0];
    const savedToday = localStorage.getItem(`workout_${today}`);
    if (savedToday) {
      setWorkoutPlan(JSON.parse(savedToday));
    }
  }, []);
  
  // Save workout history whenever it changes
  useEffect(() => {
    localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
  }, [workoutHistory]);
  
  // Save current workout plan whenever it changes
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`workout_${today}`, JSON.stringify(workoutPlan));
  }, [workoutPlan]);
  
  // Save user profile whenever it changes
  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  const bodyParts = Object.keys(exerciseData.exercises_by_body_part);
  const recommendedExercises = getRecommendedExercises();

  return (
    <div className="fitness-tracker">
      <div className="header">
        <h1>Fitness Tracker</h1>
        <div className="user-profile-summary">
          <span>{userProfile.name}</span>
          <button className="profile-button" onClick={() => alert("Profile settings would open here")}>
            Profile
          </button>
        </div>
      </div>
      
      <div className="date-selector">
        <label htmlFor="date-input">Log activities for: </label>
        <input
          id="date-input"
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          max={new Date().toISOString().split('T')[0]}
          className="date-input"
        />
        <div className="view-toggle">
          <button 
            className={`toggle-button ${!viewHistory ? 'active' : ''}`} 
            onClick={() => setViewHistory(false)}
          >
            Plan
          </button>
          <button 
            className={`toggle-button ${viewHistory ? 'active' : ''}`} 
            onClick={() => setViewHistory(true)}
          >
            History
          </button>
        </div>
      </div>
      
      {!viewHistory ? (
        <>
          <div className="metrics-tracking">
            <div className="metrics-card">
              <h3>Daily Activity</h3>
              <div className="metrics-grid">
                <div className="metric">
                  <div className="metric-value">{stepsCount}</div>
                  <div className="metric-label">Steps</div>
                </div>
                <div className="metric">
                  <div className="metric-value">{activeMinutes}</div>
                  <div className="metric-label">Active Minutes</div>
                </div>
                <div className="metric">
                  <div className="metric-value">{caloriesBurned + workoutPlan.reduce((sum, ex) => sum + ex.calories, 0)}</div>
                  <div className="metric-label">Calories</div>
                </div>
              </div>
              
              <div className="metrics-forms">
                <form onSubmit={handleAddSteps} className="metric-form">
                  <input type="number" name="steps" placeholder="Add steps" min="0" className="metric-input" />
                  <button type="submit" className="metric-button">Add</button>
                </form>
                
                <form onSubmit={handleAddActiveMinutes} className="metric-form">
                  <input type="number" name="minutes" placeholder="Add active minutes" min="0" className="metric-input" />
                  <button type="submit" className="metric-button">Add</button>
                </form>
              </div>
            </div>
          </div>
          
          <div className="ai-recommendations">
            <button 
              className="recommendations-toggle" 
              onClick={() => setShowRecommendations(!showRecommendations)}
            >
              {showRecommendations ? 'Hide Recommendations' : 'Show AI Recommendations'}
            </button>
            
            {showRecommendations && (
              <div className="recommendations-container">
                <h3>Recommended for You</h3>
                <div className="recommendations-grid">
                  {recommendedExercises.map(exercise => (
                    <div key={`rec-${exercise.title}`} className="recommendation-card">
                      <div className="recommendation-title">{exercise.title}</div>
                      <div className="recommendation-bodypart">{exercise.bodyPart}</div>
                      <div className="recommendation-details">
                        {exercise.type} • {exercise.level}
                      </div>
                      <button 
                        onClick={() => handleAddExercise(exercise, exercise.bodyPart)} 
                        className="recommendation-add-button"
                      >
                        Add to Workout
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="search-controls">
            <input
              type="text"
              placeholder="Search exercises..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <select
              value={selectedBodyPart}
              onChange={(e) => setSelectedBodyPart(e.target.value)}
              className="body-part-select"
            >
              <option value="">All Body Parts</option>
              {bodyParts.map(bodyPart => (
                <option key={bodyPart} value={bodyPart}>{bodyPart}</option>
              ))}
            </select>
          </div>
          
          <div className="exercise-list-container">
            <div className="exercise-header">
              <div>Exercise</div>
              <div>Type</div>
              <div>Level</div>
              <div>Action</div>
            </div>
            
            {Object.entries(filteredExercises()).map(([bodyPart, exercises]) => (
              <div key={bodyPart} className="body-part-section">
                <div className="body-part-title">
                  {bodyPart}
                </div>
                
                {exercises.map(exercise => (
                  <div key={exercise.title} className="exercise-item">
                    <div>
                      <div className="exercise-title">{exercise.title}</div>
                      <div className="exercise-description">{exercise.description}</div>
                      {exercise.youtube_video && (
                        <a 
                          href={exercise.youtube_video} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="exercise-video-link"
                        >
                          Watch Video
                        </a>
                      )}
                      <div className="exercise-metadata">
                        <span>Equipment: {exercise.equipment}</span>
                        {exercise.rating > 0 && (
                          <div className="exercise-rating">
                            <span className="star-icon">★</span>
                            <span>{exercise.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="exercise-details">{exercise.type}</div>
                    <div className="exercise-details">{exercise.level}</div>
                    <div className="exercise-details">
                      <button 
                        onClick={() => handleAddExercise(exercise, bodyPart)} 
                        className="add-button"
                      >
                        {editingExercise ? 'Update' : '+'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="workout-history">
          <h2>Workout History</h2>
          {Object.keys(workoutHistory).length === 0 ? (
            <div className="history-empty">No workout history found</div>
          ) : (
            <div className="history-list">
              {Object.entries(workoutHistory)
                .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                .map(([date, exercises]) => (
                  <div key={date} className="history-item">
                    <div className="history-date">
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="history-exercises">
                      {exercises.map((exercise, idx) => (
                        <div key={idx} className="history-exercise">
                          <div className="history-exercise-title">{exercise.title}</div>
                          <div className="history-exercise-details">
                            {exercise.bodyPart} • {exercise.duration} mins • {exercise.calories} cal • {exercise.reps} reps
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="history-summary">
                      <span>Total Time: {exercises.reduce((sum, ex) => sum + ex.duration, 0)} mins</span>
                      <span>Total Calories: {exercises.reduce((sum, ex) => sum + ex.calories, 0)} cal</span>
                      <span>Exercises: {exercises.length}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {!viewHistory && workoutPlan.length > 0 && (
        <div className="workout-plan">
          <h2>Workout Plan</h2>
          
          {workoutPlan.map(exercise => (
            <div key={exercise.id} className="workout-exercise">
              <div className="workout-exercise-info">
                <div className="workout-exercise-title">{exercise.title}</div>
                <div className="workout-exercise-details">
                  {exercise.bodyPart} • {exercise.duration} mins • {exercise.calories} cal • {exercise.reps} reps
                </div>
              </div>
              <div className="workout-exercise-actions">
                <button 
                  onClick={() => handleEditExercise(exercise)} 
                  className="edit-button"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleRemoveExercise(exercise.id)} 
                  className="remove-button"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          
          <div className="workout-summary">
            <div className="summary-item">
              <div className="summary-label">Total Time</div>
              <div className="summary-value">{workoutPlan.reduce((sum, ex) => sum + ex.duration, 0)} mins</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Total Calories</div>
              <div className="summary-value">{workoutPlan.reduce((sum, ex) => sum + ex.calories, 0)} cal</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Exercises</div>
              <div className="summary-value">{workoutPlan.length}</div>
            </div>
          </div>
          
          <div className="workout-actions">
            <button onClick={handleSaveWorkout} className="save-button">
              Save Workout
            </button>
          </div>
        </div>
      )}
      
      <div className="data-sync-controls">
        <h3>Data Synchronization</h3>
        <div className="sync-buttons">
          <button onClick={handleExportData} className="export-button">
            Export Data
          </button>
          <label className="import-button">
            Import Data
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogging;