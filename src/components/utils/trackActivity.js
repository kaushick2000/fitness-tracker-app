/* Last Name, First Name - Student ID */
/* 
 Suresh, Kaushick ( 1002237680 ), 
 Sivaprakash, Akshay Prassanna ( 1002198274 ) ,  
 Sonwane, Pratik ( 1002170610 ) , 
 Shaik, Arfan ( 1002260039 ) , 
 Sheth, Jeet ( 1002175315 ) 
*/

/**
 * Record a new activity in the system
 * @param {Object} activityData - Activity data to record
 * @param {number} activityData.userId - User ID
 * @param {number} activityData.steps - Number of steps
 * @param {number} activityData.minutes - Active minutes
 * @param {Object} [workoutData] - Optional workout data
 * @returns {Promise} - Promise resolving with the response
 */
export async function recordActivity(activityData, workoutData = null) {
  try {
    if (!activityData.userId) {
      throw new Error("User ID is required");
    }

    // Prepare request body with minimal parameters needed by API
    const requestBody = {
      userId: activityData.userId,
      steps: activityData.steps || 0,
      activeMinutes: activityData.minutes || 0
    };

    // If workout data is provided, format it for the API
    if (workoutData) {
      requestBody.workoutPlan = [{
        title: workoutData.title || "General Workout",
        description: workoutData.description || "Workout session",
        type: workoutData.type || "Other",
        level: workoutData.level || "Intermediate",
        duration: workoutData.duration || activityData.minutes || 30,
        date: workoutData.date || new Date(),
        bodyPart: workoutData.bodyPart || null,
        equipment: workoutData.equipment || null
      }];
    }

    // Call the existing API
    const response = await fetch('/api/activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to record activity");
    }

    return await response.json();
  } catch (error) {
    console.error("Error recording activity:", error);
    throw error;
  }
}

/**
 * Update user progress metrics
 * @param {Object} progressData - Progress data to record
 * @param {number} progressData.userId - User ID
 * @param {number} [progressData.weight] - Current weight
 * @param {number} [progressData.height] - Current height
 * @param {number} [progressData.caloriesBurned] - Calories burned
 * @returns {Promise} - Promise resolving with the response
 */
export async function updateProgress(progressData) {
  try {
    if (!progressData.userId) {
      throw new Error("User ID is required");
    }
    
    // At least one metric is required
    if (progressData.weight === undefined && 
        progressData.height === undefined && 
        progressData.caloriesBurned === undefined) {
      throw new Error("At least one progress metric is required");
    }

    // Call the existing API
    const response = await fetch('/api/activity', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: progressData.userId,
        weight: progressData.weight,
        height: progressData.height,
        caloriesBurned: progressData.caloriesBurned
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update progress");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating progress:", error);
    throw error;
  }
}

/**
 * Track a complete workout session
 * @param {Object} sessionData - Workout session data
 * @param {number} sessionData.userId - User ID
 * @param {number} sessionData.duration - Session duration in minutes
 * @param {number} sessionData.steps - Steps taken during workout
 * @param {number} sessionData.caloriesBurned - Calories burned
 * @param {string} sessionData.workoutType - Type of workout
 * @returns {Promise} - Promise resolving with the response
 */
export async function trackWorkoutSession(sessionData) {
  try {
    if (!sessionData.userId) {
      throw new Error("User ID is required");
    }

    // First record the activity
    await recordActivity(
      {
        userId: sessionData.userId,
        steps: sessionData.steps || 0,
        minutes: sessionData.duration || 0
      },
      {
        title: sessionData.workoutType || "Workout Session",
        type: sessionData.workoutType || "General",
        duration: sessionData.duration || 0,
        date: new Date()
      }
    );

    // Then update the progress if calories burned are provided
    if (sessionData.caloriesBurned) {
      await updateProgress({
        userId: sessionData.userId,
        caloriesBurned: sessionData.caloriesBurned
      });
    }

    // If weight is provided, update it too
    if (sessionData.weight) {
      await updateProgress({
        userId: sessionData.userId,
        weight: sessionData.weight
      });
    }

    return { success: true, message: "Workout session recorded successfully" };
  } catch (error) {
    console.error("Error tracking workout session:", error);
    throw error;
  }
}