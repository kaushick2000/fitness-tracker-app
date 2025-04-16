/**
 * Service to handle all dashboard data fetching and processing
 */

/**
 * Fetch user dashboard data
 * @param {number} userId - User ID to fetch data for
 * @returns {Promise} - Promise resolving to processed dashboard data
 */
export async function fetchDashboardData(userId) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const response = await fetch(`http://localhost:3000/api/activity?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.status}`);
    }
    
    const userData = await response.json();
    
    // Process and transform the data for dashboard consumption
    return processDashboardData(userData);
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    throw error;
  }
}

/**
 * Process raw API data into dashboard-friendly format
 * @param {Object} userData - Raw user data from API
 * @returns {Object} - Processed data for dashboard
 */
function processDashboardData(userData) {
  console.log(userData);
  if (!userData) {
    return {
      topMetrics: getDefaultTopMetrics(),
      progressData: getDefaultProgressData(),
      weeklyActivityData: getDefaultWeeklyData(),
      workoutTypeData: getDefaultWorkoutTypes(),
      aiInsights: getDefaultInsights(),
      userData: null
    };
  }

  return {
    topMetrics: extractTopMetrics(userData),
    progressData: extractProgressData(userData),
    weeklyActivityData: extractWeeklyActivity(userData),
    workoutTypeData: extractWorkoutTypes(userData),
    aiInsights: generateInsights(userData),
    userData: userData
  };
}

/**
 * Extract top metrics for dashboard cards
 */
function extractTopMetrics(userData) {
  console.log("userdata statistics", userData.statistics)
  return {
    weight: {
      value: userData.personalInfo?.currentWeight || 0,
      unit: "lbs"
    },
    steps: {
      value: userData.statistics?.totalSteps || 0,
      unit: "steps"
    },
    calories: {
      value: userData.statistics?.caloriesBurned || 0,
      unit: "kcal"
    }
  };
}

/**
 * Extract progress data for main chart
 */
function extractProgressData(userData) {
  // Check if we have progress records from the API
  // If not, return default data
  if (!userData.progressRecords || userData.progressRecords.length === 0) {
    return getDefaultProgressData();
  }
  
  const formattedData = [];
  const processedMonths = new Set();
  
  // Sort records by date (newest first)
  const sortedRecords = [...userData.progressRecords].sort((a, b) => 
    new Date(b.record_date) - new Date(a.record_date)
  );
  
  // Process each progress record
  sortedRecords.forEach(record => {
    const date = new Date(record.record_date);
    const month = date.toLocaleString('default', { month: 'short' });
    
    // Only add one entry per month (the most recent)
    if (!processedMonths.has(month)) {
      processedMonths.add(month);
      
      formattedData.push({
        month,
        weight: record.weight || 0,
        steps: record.steps || 0,
        calories: record.calories_burnt || 0,
        workoutDuration: record.workout_duration || 0
      });
    }
  });
  
  // If processed data is empty, return default
  return formattedData.length > 0 ? formattedData : getDefaultProgressData();
}

/**
 * Extract weekly activity data
 */
function extractWeeklyActivity(userData) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyData = days.map(day => ({ day, minutes: 0 }));
  
  // Get activities from the API
  const activities = userData.activities || [];
  
  // Get today's date
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);
  
  // Process each activity
  activities.forEach(activity => {
    const date = new Date(activity.date);
    
    // Check if the activity is from the past week
    if (date >= weekAgo && date <= today) {
      const dayIndex = date.getDay(); // 0 = Sunday, 6 = Saturday
      weeklyData[dayIndex].minutes += (activity.minutes || 0);
    }
  });
  
  return weeklyData;
}

/**
 * Extract workout type data for pie chart
 */
function extractWorkoutTypes(userData) {
  const typeCount = {};
  const workouts = userData.workouts || [];
  
  workouts.forEach(workout => {
    const type = workout.exerciseType || "Other";
    typeCount[type] = (typeCount[type] || 0) + 1;
  });
  
  const result = Object.entries(typeCount).map(([name, value]) => ({ name, value }));
  
  return result.length > 0 ? result : getDefaultWorkoutTypes();
}

/**
 * Generate AI insights based on user data
 */
function generateInsights(userData) {
  const insights = [];
  
  // Weight progress insight
  if (userData.personalInfo?.currentWeight && userData.personalInfo?.goalWeight) {
    const currentWeight = userData.personalInfo.currentWeight;
    const goalWeight = userData.personalInfo.goalWeight;
    
    if (currentWeight > goalWeight) {
      const difference = currentWeight - goalWeight;
      insights.push(`You're ${difference} lbs away from your goal weight.`);
    } else if (currentWeight < goalWeight) {
      const difference = goalWeight - currentWeight;
      insights.push(`You've reached and surpassed your goal weight by ${difference} lbs!`);
    } else {
      insights.push("You've reached your goal weight! Consider setting a new goal.");
    }
  }
  
  // Workout streak insight
  if (userData.statistics?.currentStreak > 0) {
    insights.push(`You're on a ${userData.statistics.currentStreak}-day workout streak. Keep it up!`);
  } else {
    insights.push("Try to work out today to start a new streak!");
  }
  
  // Workout variety insight
  const workoutTypes = new Set();
  (userData.workouts || []).forEach(w => {
    if (w.exerciseType) workoutTypes.add(w.exerciseType);
  });
  
  if (workoutTypes.size <= 1) {
    insights.push("Try adding more variety to your workouts for better results.");
  } else if (workoutTypes.size <= 3) {
    insights.push("Good job mixing up your workout routine!");
  } else {
    insights.push("Great workout variety! You're working multiple fitness aspects.");
  }
  
  return insights.length > 0 ? insights : getDefaultInsights();
}

// Default data functions when no real data is available
function getDefaultTopMetrics() {
  return {
    weight: { value: 160, unit: "lbs" },
    steps: { value: 8500, unit: "steps" },
    calories: { value: 1850, unit: "kcal" }
  };
}

function getDefaultProgressData() {
  return [
    { month: "Jan", weight: 180, steps: 5000, calories: 2200, workoutDuration: 45 },
    { month: "Feb", weight: 175, steps: 6000, calories: 2100, workoutDuration: 60 },
    { month: "Mar", weight: 170, steps: 7000, calories: 2000, workoutDuration: 75 },
    { month: "Apr", weight: 168, steps: 8000, calories: 1900, workoutDuration: 90 },
    { month: "May", weight: 165, steps: 8500, calories: 1850, workoutDuration: 95 },
    { month: "Jun", weight: 163, steps: 9000, calories: 1800, workoutDuration: 100 },
    { month: "Jul", weight: 160, steps: 9500, calories: 1750, workoutDuration: 105 },
  ];
}

function getDefaultWeeklyData() {
  return [
    { day: "Mon", minutes: 30 },
    { day: "Tue", minutes: 45 },
    { day: "Wed", minutes: 25 },
    { day: "Thu", minutes: 60 },
    { day: "Fri", minutes: 90 },
    { day: "Sat", minutes: 20 },
    { day: "Sun", minutes: 15 },
  ];
}

function getDefaultWorkoutTypes() {
  return [
    { name: "Cardio", value: 30 },
    { name: "Stretching", value: 40 },
    { name: "Weights", value: 15 },
    { name: "Strength", value: 25 },
  ];
}

function getDefaultInsights() {
  return [
    "You're consistently improving your daily steps.",
    "Consider increasing workout duration for better results.",
    "Steady weight loss trend observed."
  ];
}