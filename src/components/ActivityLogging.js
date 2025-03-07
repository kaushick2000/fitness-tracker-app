import React, { useEffect, useState } from 'react';
import exercises from "../data/exercises_with_youtube.json";
import './ui/ActivityLogging.css';

// Sample data based on the JSON structure
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
  useEffect(() => {
    if (exercises !== undefined) {
      setExerciseData(exercises);
    }
  }, [exercises]);
  
  const [exerciseData, setExerciseData] = useState(initialExerciseData);
  const [selectedBodyPart, setSelectedBodyPart] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [workoutPlan, setWorkoutPlan] = useState([]);

  const handleAddExercise = (exercise, bodyPart) => {
    const duration = 15;
    const calories = 150;
    
    const newExercise = {
      ...exercise,
      id: Date.now(),
      bodyPart,
      duration,
      calories,
      reps: 12
    };
    
    setWorkoutPlan([...workoutPlan, newExercise]);
  };

  const handleRemoveExercise = (id) => {
    setWorkoutPlan(workoutPlan.filter(exercise => exercise.id !== id));
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

  const bodyParts = Object.keys(exerciseData.exercises_by_body_part);

  return (
    <div className="fitness-tracker">
      <div className="header">
        <h1>Fitness Tracker</h1>
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
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {workoutPlan.length > 0 && (
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
              <button 
                onClick={() => handleRemoveExercise(exercise.id)} 
                className="remove-button"
              >
                ×
              </button>
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
        </div>
      )}
    </div>
  );
};

export default ActivityLogging;