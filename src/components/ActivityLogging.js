/* Last Name, First Name - Student ID */
/* 
 Suresh, Kaushick ( 1002237680 ), 
 Sivaprakash, Akshay Prassanna ( 1002198274 ) ,  
 Sonwane, Pratik ( 1002170610 ) , 
 Shaik, Arfan ( 1002260039 ) , 
 Sheth, Jeet ( 1002175315 ) 
*/

import React, { useEffect, useState } from "react";
import exercises from "../data/exercises_with_youtube.json";
import "../styles/ActivityLogging.css";
import Nav from "../components/Nav";

const initialExerciseData = {
  exercises_by_body_part: {
    Abdominals: [
      {
        title: "Partner plank band row",
        description:
          "The partner plank band row is an abdominal exercise where two partners perform single-arm planks while pulling on the opposite ends of an exercise band. This technique can be done for time or reps in any ab-focused workout.",
        type: "Strength",
        equipment: "Bands",
        level: "Intermediate",
        rating: 0.0,
        youtube_video: "https://www.youtube.com/watch?v=2dAndIUJ-68",
      },
      {
        title: "Banded crunch isometric hold",
        description:
          'The banded crunch isometric hold is an exercise targeting the abdominal muscles, particularly the rectus abdominis or "six-pack" muscles. The band adds resistance and continuous tension to this popular exercise.',
        type: "Strength",
        equipment: "Bands",
        level: "Intermediate",
        rating: 0,
        youtube_video: "https://www.youtube.com/watch?v=WL65_NRRh8Y",
      },
    ],
    Chest: [
      {
        title: "Push-ups",
        description:
          "A classic bodyweight exercise that targets the chest, shoulders, and triceps.",
        type: "Strength",
        equipment: "None",
        level: "Beginner",
        rating: 4.8,
        youtube_video: "https://www.youtube.com/watch?v=IODxDxX7oi4",
      },
      {
        title: "Bench Press",
        description:
          "A compound exercise that targets the chest, shoulders, and triceps using a barbell or dumbbells.",
        type: "Strength",
        equipment: "Barbell/Dumbbells",
        level: "Intermediate",
        rating: 4.9,
        youtube_video: "https://www.youtube.com/watch?v=vcBig73ojpE",
      },
    ],
    Back: [
      {
        title: "Dumbbell Flyes",
        description:
          "An isolation exercise that targets the chest muscles using dumbbells.",
        type: "Strength",
        equipment: "Dumbbells",
        level: "Intermediate",
        rating: 4.5,
        youtube_video: "https://www.youtube.com/watch?v=eozdVDA78K0",
      },
    ],
  },
};

const ActivityLogging = () => {
  // State declarations first
  const [exerciseData, setExerciseData] = useState(initialExerciseData);
  const [selectedBodyPart, setSelectedBodyPart] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [workoutHistory, setWorkoutHistory] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
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
      activeMinutes: 150,
    },
  });
  const [purchasedPlans, setPurchasedPlans] = useState(() => {
    const savedPlans = localStorage.getItem("purchasedPlans");
    return savedPlans ? JSON.parse(savedPlans) : [];
  });
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [planWorkoutsAdded, setPlanWorkoutsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreExercises, setHasMoreExercises] = useState(true);
  const [exercisesPerPage] = useState(20);

  // Function to fetch exercises from the database
  const ExercisesList = () => {
    // Existing component code can remain the same
    // This focuses on the rendering part of the exercises

    return (
      <div className="exercise-list-container">
        <div className="exercise-header">Exercises</div>

        {isLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading exercises...</p>
          </div>
        )}

        {!isLoading && Object.keys(filteredExercises()).length === 0 && (
          <div className="no-exercises">
            <p>No exercises found. Try changing your search criteria.</p>
          </div>
        )}

        {!isLoading &&
          Object.entries(filteredExercises()).map(([bodyPart, exercises]) => (
            <div key={bodyPart} className="exercise-category">
              <h3 className="body-part-title">{bodyPart}</h3>
              <div className="exercise-items ">
                {exercises.map((exercise) => (
                  <div
                    key={exercise.exercise_id || exercise.title}
                    className="exercise-item "
                  >
                    <div className="exercise-title">{exercise.title}</div>
                    <div className="exercise-details">
                      {exercise.equipment && (
                        <span className="equipment">{exercise.equipment}</span>
                      )}
                      {exercise.rating > 0 && (
                        <span className="rating">
                          <span className="stars">
                            {"★".repeat(Math.round(exercise.rating / 2))}
                          </span>
                          <span className="rating-value">
                            ({exercise.rating})
                          </span>
                        </span>
                      )}
                    </div>
                    {exercise.description && (
                      <div className="exercise-description">
                        {exercise.description}
                      </div>
                    )}
                    {exercise.youtube_video && (
                      <a
                        href={exercise.youtube_video}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="video-link"
                      >
                        Watch Video Tutorial
                      </a>
                    )}
                    <div className="exercise-info "></div>

                    <div className="exercise-type-level">
                      <div className="exercise-type">
                        <span
                          className={`type-badge ${exercise.type.toLowerCase()}`}
                        >
                          {exercise.type}
                        </span>
                      </div>
                      <div className="exercise-level">
                        <span
                          className={`level-badge ${exercise.level.toLowerCase()}`}
                        >
                          {exercise.level}
                        </span>
                      </div>
                    </div>

                    <div className="exercise-action">
                      <button
                        onClick={() => handleAddExercise(exercise, bodyPart)}
                        className={`add-button ${
                          editingExercise && editingExercise.id === exercise.id
                            ? "editing"
                            : ""
                        }`}
                      >
                        {editingExercise && editingExercise.id === exercise.id
                          ? "Update"
                          : "+"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

        {!isLoading &&
          Object.keys(filteredExercises()).length > 0 &&
          hasMoreExercises && (
            <div className="load-more-container">
              <button
                onClick={loadMoreExercises}
                className="load-more-button"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Load More Exercises"}
              </button>
            </div>
          )}
      </div>
    );
  };
  // Replace the fetchExercises function with this improved version
  const fetchExercises = async (page = 1, reset = false) => {
    try {
      setIsLoading(true);

      // Build query parameters
      const queryParams = new URLSearchParams({
        page,
        limit: exercisesPerPage,
      });

      if (selectedBodyPart && selectedBodyPart !== "") {
        queryParams.append("bodyPart", selectedBodyPart);
      }

      if (searchQuery && searchQuery !== "") {
        queryParams.append("search", searchQuery);
      }

      const response = await fetch(
        `http://localhost:3000/api/exercises?${queryParams}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch exercises");
      }

      const data = await response.json();
      console.log("API Response:", data); // Add this for debugging

      // Transform data to match component's expected format
      const exercisesByBodyPart = {};

      // Make sure we're accessing the correct property in the response
      const exercises = data.exercises || [];

      // Group exercises by body part
      exercises.forEach((exercise) => {
        const bodyPart = exercise.body_part || "Other";

        if (!exercisesByBodyPart[bodyPart]) {
          exercisesByBodyPart[bodyPart] = [];
        }

        exercisesByBodyPart[bodyPart].push({
          title: exercise.title,
          description: exercise.description || "",
          type: exercise.type || "Strength",
          equipment: exercise.equipment || "None",
          level: exercise.level || "Beginner",
          rating: exercise.rating || 0,
          youtube_video: exercise.youtube_video || "",
          exercise_id: exercise.exercise_id,
        });
      });

      // Update pagination state
      setCurrentPage(page);
      setHasMoreExercises(
        data.pagination ? page < data.pagination.pages : false
      );

      // Create the new state object
      const newData = { exercises_by_body_part: exercisesByBodyPart };

      console.log("Transformed data:", newData); // Add this for debugging

      // If reset is true, replace data; otherwise, merge with existing data
      if (reset) {
        setExerciseData(newData); // Directly update state here
        return newData;
      } else {
        // Merge new exercises with existing ones
        const mergedData = {
          exercises_by_body_part: {
            ...exerciseData.exercises_by_body_part,
          },
        };

        Object.keys(exercisesByBodyPart).forEach((bodyPart) => {
          if (mergedData.exercises_by_body_part[bodyPart]) {
            // Filter out duplicates based on exercise_id
            const existingIds = new Set(
              mergedData.exercises_by_body_part[bodyPart].map(
                (ex) => ex.exercise_id
              )
            );
            const newExercises = exercisesByBodyPart[bodyPart].filter(
              (ex) => !existingIds.has(ex.exercise_id)
            );
            mergedData.exercises_by_body_part[bodyPart] = [
              ...mergedData.exercises_by_body_part[bodyPart],
              ...newExercises,
            ];
          } else {
            mergedData.exercises_by_body_part[bodyPart] =
              exercisesByBodyPart[bodyPart];
          }
        });

        setExerciseData(mergedData); // Directly update state here
        return mergedData;
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
      return reset ? initialExerciseData : exerciseData;
    } finally {
      setIsLoading(false);
    }
  };

  // Add a loadMoreExercises function
  const loadMoreExercises = async () => {
    if (!isLoading && hasMoreExercises) {
      const newData = await fetchExercises(currentPage + 1);
      // No need to set state here as fetchExercises already does it
    }
  };

  // Function to fetch workout history from the API
  const fetchWorkoutHistory = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/activity?userId=${userId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch workout history");
      }
      const data = await response.json();

      // Transform the data to match the component's expected format
      const formattedHistory = {};

      // Process workouts from the database
      data.workouts.forEach((workout) => {
        const date = new Date(workout.workout_date).toISOString().split("T")[0];

        if (!formattedHistory[date]) {
          formattedHistory[date] = [];
        }

        formattedHistory[date].push({
          id: workout.workout_id,
          title: workout.exercise.title,
          bodyPart: workout.exercise.body_part,
          duration: workout.duration,
          calories: Math.round(workout.duration * 5), // Simple calorie estimation
          reps: 12, // Default value if not stored
          date: date,
          type: workout.exercise.type,
          level: workout.exercise.level,
          description: workout.exercise.description,
          youtube_video: workout.exercise.youtube_video,
        });
      });

      return formattedHistory;
    } catch (error) {
      console.error("Error fetching workout history:", error);
      return {};
    }
  };

  // Function to save workout to the API
  const saveWorkoutToAPI = async (
    userId,
    workoutPlan,
    stepsData,
    minutesData
  ) => {
    try {
      console.log("Sending request to API with data:", {
        userId,
        workoutPlan,
        steps: stepsData,
        activeMinutes: minutesData,
      });

      const response = await fetch("http://localhost:3000/api/activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          workoutPlan,
          steps: stepsData,
          activeMinutes: minutesData,
        }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to save workout: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error saving workout:", error);
      throw error;
    }
  };

  // Function to fetch user profile data
  const fetchUserProfile = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/profile?userId=${userId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();

      // Transform the data to match the component's expected format
      const purchasedPlans = data.profile.purchase_plans
        ? JSON.parse(data.profile.purchase_plans)
        : [];

      let activePlan = {};
      try {
        activePlan = data.profile.active_plan
          ? JSON.parse(data.profile.active_plan)
          : {};
      } catch (e) {
        activePlan = {};
      }

      return {
        name: data.profile.user ? data.profile.user.name : "User",
        age: 30, // Default if not stored
        weight: data.profile.curr_weight || 70,
        height: data.profile.curr_height || 175,
        fitnessGoals: activePlan.fitnessGoals || "Build muscle",
        weeklyTarget: activePlan.weeklyTarget || {
          workouts: 4,
          steps: 70000,
          activeMinutes: 150,
        },
        purchasedPlans,
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  // Function to update user profile data
  const updateUserProfile = async (userId, profileData) => {
    try {
      const response = await fetch("http://localhost:3000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          ...profileData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user profile");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  };
  // Improved handleSaveWorkout function
  const handleSaveWorkout = async () => {
    try {
      // Validate workout data before saving
      if (workoutPlan.length === 0) {
        alert(
          "Please add at least one exercise to your workout before saving."
        );
        return;
      }

      // Get userId from localStorage, with fallback
      const userId = localStorage.getItem("userId") || "1"; // Default to 1 for testing

      // Prepare workouts in the format expected by the API
      const workoutData = workoutPlan.map((exercise) => ({
        exercise_id: exercise.exercise_id,
        duration: exercise.duration || 15, // Default to 15 mins if not specified
        date: selectedDate,
        reps: exercise.reps || 12, // Optional, if your API accepts this
      }));

      console.log("Sending workout data:", {
        userId,
        workouts: workoutData,
        steps: stepsCount,
        activeMinutes: activeMinutes,
      });

      // Send workout data to the API
      const response = await fetch("http://localhost:3000/api/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          workouts: workoutData,
          steps: stepsCount,
          activeMinutes: activeMinutes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Server error response:", errorData);
        throw new Error(
          `Failed to save workout: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("Workout saved successfully:", result);

      // Update local state
      const updatedHistory = { ...workoutHistory };
      updatedHistory[selectedDate] = [...workoutPlan];
      setWorkoutHistory(updatedHistory);

      // Optionally, refresh workout history data from the server
      const updatedHistoryFromServer = await fetchWorkoutHistory(userId);
      if (Object.keys(updatedHistoryFromServer).length > 0) {
        setWorkoutHistory(updatedHistoryFromServer);
      }

      // Reset steps and active minutes after saving
      setStepsCount(0);
      setActiveMinutes(0);

      alert("Workout saved successfully!");
    } catch (error) {
      console.error("Error saving workout:", error);
      alert(`Error saving workout: ${error.message}. Please try again.`);
    }
  };

  // Function to add workouts based on purchased plan level
  const addPlanBasedWorkouts = () => {
    if (planWorkoutsAdded || workoutPlan.length > 0) {
      return; // Don't add exercises if already added or user already has a plan
    }

    // Get all exercises from all body parts
    const allExercises = [];
    Object.entries(exerciseData.exercises_by_body_part).forEach(
      ([bodyPart, exercises]) => {
        exercises.forEach((exercise) => {
          allExercises.push({ ...exercise, bodyPart });
        });
      }
    );

    // Check if user has a purchased plan
    if (purchasedPlans && purchasedPlans.length > 0) {
      const planLevel = purchasedPlans[0].toLowerCase(); // Get the first plan level

      // Filter exercises based on plan level
      let levelExercises = [];

      if (planLevel === "beginner") {
        levelExercises = allExercises.filter(
          (ex) => ex.level.toLowerCase() === "beginner"
        );
      } else if (planLevel === "intermediate") {
        levelExercises = allExercises.filter(
          (ex) => ex.level.toLowerCase() === "intermediate"
        );
      } else if (planLevel === "advanced") {
        levelExercises = allExercises.filter(
          (ex) => ex.level.toLowerCase() === "advanced"
        );
      }

      // If no exercises found for the level, use all exercises
      if (levelExercises.length === 0) {
        levelExercises = allExercises;
      }

      // Shuffle the exercises and pick 5 random ones
      const shuffled = levelExercises.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 5);

      // Add each exercise to the workout plan
      const newWorkoutPlan = [];
      selected.forEach((exercise) => {
        // Calculate calories for the exercise
        const intensityFactors = {
          Strength: 0.08,
          Cardio: 0.12,
          Flexibility: 0.05,
        };

        const intensityFactor = intensityFactors[exercise.type] || 0.08;
        const userWeight = userProfile.weight;
        const duration = 15;
        const calories = Math.round(userWeight * intensityFactor * duration);

        const newExercise = {
          ...exercise,
          id: Date.now() + Math.random(), // Ensure unique IDs
          duration,
          calories,
          reps: 12,
          date: selectedDate,
        };

        newWorkoutPlan.push(newExercise);
      });

      // Set the workout plan with these exercises
      setWorkoutPlan(newWorkoutPlan);
      setPlanWorkoutsAdded(true);

      console.log(
        `Added ${selected.length} ${planLevel} level exercises to workout plan`
      );
    }
  };

  // AI recommendation system
  const getRecommendedExercises = () => {
    // Analyze workout history to find patterns
    const bodyPartFrequency = {};
    const exerciseTypeFrequency = {};
    const recentExercises = [];

    // Count frequency of body parts and exercise types in history
    Object.values(workoutHistory).forEach((dayPlan) => {
      dayPlan.forEach((exercise) => {
        bodyPartFrequency[exercise.bodyPart] =
          (bodyPartFrequency[exercise.bodyPart] || 0) + 1;
        exerciseTypeFrequency[exercise.type] =
          (exerciseTypeFrequency[exercise.type] || 0) + 1;

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
      .map((entry) => entry[0]);

    // Find preferred exercise types
    const preferredTypes = Object.entries(exerciseTypeFrequency)
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0]);

    // Based on user's fitness goals, recommend appropriate exercises
    const recommendations = [];

    // Get all available exercises
    const allExercises = [];
    Object.entries(exerciseData.exercises_by_body_part).forEach(
      ([bodyPart, exercises]) => {
        exercises.forEach((exercise) => {
          allExercises.push({ ...exercise, bodyPart });
        });
      }
    );

    // Prioritize under-worked body parts
    const underworkedBodyParts = sortedBodyParts.slice(0, 2);

    // Filter exercises by user goals and level
    let goalMatch;
    switch (userProfile.fitnessGoals.toLowerCase()) {
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
    allExercises.forEach((exercise) => {
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
      recommendations.push({ ...exercise, score });
    });

    // Sort by score and take top 5
    return recommendations.sort((a, b) => b.score - a.score).slice(0, 5);
  };

  const handleAddExercise = (exercise, bodyPart) => {
    // Calculate more realistic calories based on exercise type and user profile
    const intensityFactors = {
      Strength: 0.08,
      Cardio: 0.12,
      Flexibility: 0.05,
    };

    const intensityFactor = intensityFactors[exercise.type] || 0.08;
    const userWeight = userProfile.weight;

    // More realistic formula: weight * intensity factor * duration
    const duration = 15;
    const calories = Math.round(userWeight * intensityFactor * duration);

    if (editingExercise) {
      // Update existing exercise
      const updatedWorkoutPlan = workoutPlan.map((ex) =>
        ex.id === editingExercise.id
          ? {
              ...exercise,
              id: ex.id,
              exercise_id: exercise.exercise_id, // Include exercise_id from database
              bodyPart,
              duration,
              calories,
              reps: 12,
              date: selectedDate,
            }
          : ex
      );
      setWorkoutPlan(updatedWorkoutPlan);
      setEditingExercise(null);
    } else {
      // Add new exercise
      const newExercise = {
        ...exercise,
        id: Date.now(),
        exercise_id: exercise.exercise_id, // Include exercise_id from database
        bodyPart,
        duration,
        calories,
        reps: 12,
        date: selectedDate,
      };

      setWorkoutPlan([...workoutPlan, newExercise]);
    }
  };

  const handleRemoveExercise = (id) => {
    if (window.confirm("Are you sure you want to remove this exercise?")) {
      setWorkoutPlan(workoutPlan.filter((exercise) => exercise.id !== id));
    }
  };

  const handleEditExercise = (exercise) => {
    setEditingExercise(exercise);
    setSelectedBodyPart(exercise.bodyPart);

    // Scroll to exercise selection
    document
      .querySelector(".exercise-list-container")
      .scrollIntoView({ behavior: "smooth" });
  };

  // const handleSaveWorkout = () => {
  //   const updatedHistory = { ...workoutHistory };
  //   updatedHistory[selectedDate] = [...workoutPlan];

  //   setWorkoutHistory(updatedHistory);
  //   alert("Workout saved successfully!");
  // };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);

    // Load workout for selected date if it exists
    if (workoutHistory[newDate]) {
      setWorkoutPlan([...workoutHistory[newDate]]);
      setPlanWorkoutsAdded(true); // Mark as added since we're loading existing data
    } else {
      setWorkoutPlan([]);
      setPlanWorkoutsAdded(false); // Reset flag for the new date
    }
  };

  const handleAddSteps = async (e) => {
    e.preventDefault();
    const steps = parseInt(e.target.steps.value) || 0;

    try {
      const userId = localStorage.getItem("userId") || 1;
      await saveActivityToAPI(userId, steps, 0);

      // Update UI after successful save
      setStepsCount(stepsCount + steps);

      // Update total calories based on steps (rough estimate)
      const caloriesPerStep = 0.04;
      const newCalories = Math.round(steps * caloriesPerStep);
      setCaloriesBurned(caloriesBurned + newCalories);

      // Clear form
      e.target.steps.value = "";
    } catch (error) {
      alert("Error saving steps. Please try again.");
    }
  };

  const handleAddActiveMinutes = async (e) => {
    e.preventDefault();
    const minutes = parseInt(e.target.minutes.value) || 0;

    try {
      const userId = localStorage.getItem("userId") || 1;
      await saveActivityToAPI(userId, 0, minutes);

      // Update UI after successful save
      setActiveMinutes(activeMinutes + minutes);

      // Update total calories based on active minutes (rough estimate)
      const caloriesPerMinute = 4;
      const newCalories = minutes * caloriesPerMinute;
      setCaloriesBurned(caloriesBurned + newCalories);

      // Clear form
      e.target.minutes.value = "";
    } catch (error) {
      alert("Error saving active minutes. Please try again.");
    }
  };

  const handleExportData = () => {
    const dataToExport = {
      profile: userProfile,
      history: workoutHistory,
      currentPlan: workoutPlan,
    };

    const dataStr = JSON.stringify(dataToExport);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "fitness_data.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
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

      bodyParts.forEach((bodyPart) => {
        const matchingExercises = exerciseData.exercises_by_body_part[
          bodyPart
        ].filter((exercise) =>
          exercise.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (matchingExercises.length > 0) {
          results[bodyPart] = matchingExercises;
        }
      });

      return results;
    }

    if (selectedBodyPart) {
      return {
        [selectedBodyPart]:
          exerciseData.exercises_by_body_part[selectedBodyPart] || [],
      };
    }

    return exerciseData.exercises_by_body_part;
  };

  // Effects last, after state and functions
  useEffect(() => {
    const loadExerciseData = async () => {
      try {
        // First fetch from API
        const apiExercises = await fetchExercises();

        // Only fallback to local JSON if API returns empty results
        if (
          Object.keys(apiExercises.exercises_by_body_part).length === 0 &&
          exercises !== undefined
        ) {
          console.log("Using fallback local exercise data");
          setExerciseData(exercises);
        }
      } catch (error) {
        console.error("Error loading exercise data:", error);
        // Fallback to local JSON if API fails
        if (exercises !== undefined) {
          setExerciseData(exercises);
        }
      }
    };

    loadExerciseData();

    // Load saved data from localStorage on component mount
    const savedWorkouts = localStorage.getItem("workoutHistory");
    if (savedWorkouts) {
      setWorkoutHistory(JSON.parse(savedWorkouts));
    }

    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }

    // Load workout for today if it exists
    const today = new Date().toISOString().split("T")[0];
    const savedToday = localStorage.getItem(`workout_${today}`);
    if (savedToday) {
      setWorkoutPlan(JSON.parse(savedToday));
      setPlanWorkoutsAdded(true); // Mark as added since we're loading existing data
    }
  }, []);

  useEffect(() => {
    // Reset and fetch new data when search query or body part changes
    const loadFilteredExercises = async () => {
      setCurrentPage(1);
      setHasMoreExercises(true);
      const exercises = await fetchExercises(1, true);
      setExerciseData(exercises);
    };

    // Use a debounce to avoid too many requests while typing
    const handler = setTimeout(() => {
      loadFilteredExercises();
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery, selectedBodyPart]);

  // Add plan-based workouts when exercise data is loaded and plan is available
  useEffect(() => {
    if (
      exerciseData &&
      purchasedPlans.length > 0 &&
      !planWorkoutsAdded &&
      workoutPlan.length === 0
    ) {
      addPlanBasedWorkouts();
    }
  }, [exerciseData, purchasedPlans, planWorkoutsAdded, workoutPlan]);

  // Save workout history whenever it changes
  useEffect(() => {
    localStorage.setItem("workoutHistory", JSON.stringify(workoutHistory));
  }, [workoutHistory]);

  // Save current workout plan whenever it changes
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`workout_${today}`, JSON.stringify(workoutPlan));
  }, [workoutPlan]);

  // Save user profile whenever it changes
  useEffect(() => {
    localStorage.setItem("userProfile", JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem("purchasedPlans", JSON.stringify(purchasedPlans));
  }, [purchasedPlans]);

  useEffect(() => {
    const loadUserData = async () => {
      // Assume userId is stored in context or localStorage
      const userId = localStorage.getItem("userId") || 1; // Default to 1 for testing

      // Fetch user profile
      const profile = await fetchUserProfile(userId);
      if (profile) {
        setUserProfile(profile);
        setPurchasedPlans(profile.purchasedPlans || []);
      }

      // Fetch workout history
      const history = await fetchWorkoutHistory(userId);
      if (Object.keys(history).length > 0) {
        setWorkoutHistory(history);
      }

      // Load workout for today if it exists
      const today = new Date().toISOString().split("T")[0];
      if (history[today]) {
        setWorkoutPlan([...history[today]]);
        setPlanWorkoutsAdded(true);
      }
    };

    loadUserData();
  }, []);

  const saveActivityToAPI = async (userId, stepsData, minutesData) => {
    try {
      const response = await fetch("http://localhost:3000/api/activity/steps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          steps: stepsData,
          minutes: minutesData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save activity data");
      }

      return await response.json();
    } catch (error) {
      console.error("Error saving activity data:", error);
      throw error;
    }
  };

  const bodyParts = Object.keys(exerciseData.exercises_by_body_part);
  const recommendedExercises = getRecommendedExercises();

  return (
    <div className="app-container">
      <div className="nav-wrapper">
        <Nav purchasedPlans={purchasedPlans} />
      </div>
      <div className="fitness-tracker">
        <div className="header">
          <h1>Fitness Tracker</h1>
          <div className="user-profile-summary">
            <span>{userProfile.name}</span>
            <button
              className="profile-button"
              onClick={() => alert("Profile settings would open here")}
            >
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
            max={new Date().toISOString().split("T")[0]}
            className="date-input"
          />
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
                    <div className="metric-value">
                      {caloriesBurned +
                        workoutPlan.reduce((sum, ex) => sum + ex.calories, 0)}
                    </div>
                    <div className="metric-label">Calories</div>
                  </div>
                </div>

                <div className="metrics-forms">
                  <form onSubmit={handleAddSteps} className="metric-form">
                    <input
                      type="number"
                      name="steps"
                      placeholder="Add steps"
                      min="0"
                      className="metric-input"
                    />
                    <button type="submit" className="metric-button">
                      Add
                    </button>
                  </form>

                  <form
                    onSubmit={handleAddActiveMinutes}
                    className="metric-form"
                  >
                    <input
                      type="number"
                      name="minutes"
                      placeholder="Add active minutes"
                      min="0"
                      className="metric-input"
                    />
                    <button type="submit" className="metric-button">
                      Add
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="ai-recommendations">
              <button
                className="recommendations-toggle"
                onClick={() => setShowRecommendations(!showRecommendations)}
              >
                {showRecommendations
                  ? "Hide Recommendations"
                  : "Show AI Recommendations"}
              </button>

              {showRecommendations && (
                <div className="recommendations-container">
                  <h3>Recommended for You</h3>
                  <div className="recommendations-grid">
                    {recommendedExercises.map((exercise) => (
                      <div
                        key={`rec-${exercise.title}`}
                        className="recommendation-card"
                      >
                        <div className="recommendation-title">
                          {exercise.title}
                        </div>
                        <div className="recommendation-bodypart">
                          {exercise.bodyPart}
                        </div>
                        <div className="recommendation-details">
                          {exercise.type} • {exercise.level}
                        </div>
                        <button
                          onClick={() =>
                            handleAddExercise(exercise, exercise.bodyPart)
                          }
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
                {bodyParts.map((bodyPart) => (
                  <option key={bodyPart} value={bodyPart}>
                    {bodyPart}
                  </option>
                ))}
              </select>
            </div>

            <ExercisesList />
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
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="history-exercises">
                        {exercises.map((exercise, idx) => (
                          <div key={idx} className="history-exercise">
                            <div className="history-exercise-title">
                              {exercise.title}
                            </div>
                            <div className="history-exercise-details">
                              {exercise.bodyPart} • {exercise.duration} mins •{" "}
                              {exercise.calories} cal • {exercise.reps} reps
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="history-summary">
                        <span>
                          Total Time:{" "}
                          {exercises.reduce((sum, ex) => sum + ex.duration, 0)}{" "}
                          mins
                        </span>
                        <span>
                          Total Calories:{" "}
                          {exercises.reduce((sum, ex) => sum + ex.calories, 0)}{" "}
                          cal
                        </span>
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

            {workoutPlan.map((exercise) => (
              <div key={exercise.id} className="workout-exercise">
                <div className="workout-exercise-info">
                  <div className="workout-exercise-title">{exercise.title}</div>
                  <div className="workout-exercise-details">
                    {exercise.bodyPart} • {exercise.duration} mins •{" "}
                    {exercise.calories} cal • {exercise.reps} reps
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
                <div className="summary-value">
                  {workoutPlan.reduce((sum, ex) => sum + ex.duration, 0)} mins
                </div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Total Calories</div>
                <div className="summary-value">
                  {workoutPlan.reduce((sum, ex) => sum + ex.calories, 0)} cal
                </div>
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

        {/* <div className="data-sync-controls">
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
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default ActivityLogging;
