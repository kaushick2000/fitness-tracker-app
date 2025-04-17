import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import "../styles/AnalyticsDashboard.css";
import Nav from "./Nav";
import { 
  generateFitnessInsights, 
  generateExerciseRecommendations 
} from "./OpenRouter/NVIDIA_Api"; // Import API functions

const AnalyticsDashboard = ({ userData }) => {
  const [timeFrame, setTimeFrame] = useState("weekly");
  const [selectedMetric, setSelectedMetric] = useState("calories");
  const [bodyPartFilter, setBodyPartFilter] = useState("All");
  const [purchasedPlans, setPurchasedPlans] = useState(() => {
    const savedPlans = localStorage.getItem("purchasedPlans");
    return savedPlans ? JSON.parse(savedPlans) : [];
  });
  
  // Analytics data state
  const [analyticsData, setAnalyticsData] = useState({
    calories: [],
    exerciseTime: [],
    weight: [],
    bodyPartDistribution: [],
    difficultyDistribution: [],
    predictiveWeight: [],
    exerciseRecommendations: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for AI insights and recommended exercises
  const [aiInsights, setAiInsights] = useState({
    performancePatterns: "",
    recoveryAnalysis: "",
    nutritionImpact: ""
  });
  const [recommendedExercises, setRecommendedExercises] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [exercisesLoading, setExercisesLoading] = useState(false);

  // Fetch analytics data from the API
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        // Get the userId from localStorage or context
        const userId = localStorage.getItem("userId");
        
        if (!userId) {
          setError("User ID not found. Please log in.");
          setLoading(false);
          return;
        }
        
        const response = await fetch(`http://localhost:3000/api/analytics?userId=${userId}&timeFrame=${timeFrame}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }
        
        const data = await response.json();
        
        // Validate received data
        const validatedData = validateAnalyticsData(data);
        setAnalyticsData(validatedData);
        setLoading(false);
        
        // After getting analytics data, fetch AI insights and recommendations
        fetchAiInsights(validatedData);
        fetchExerciseRecommendations(validatedData, bodyPartFilter);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [timeFrame]); // Re-fetch when timeFrame changes
  
  // Function to validate and sanitize analytics data
  const validateAnalyticsData = (data) => {
    // Create a deep copy to avoid modifying the original
    const validatedData = { ...data };
    
    // Ensure predictiveWeight values are reasonable
    if (validatedData.predictiveWeight && validatedData.predictiveWeight.length > 0) {
      validatedData.predictiveWeight = validatedData.predictiveWeight.map(item => {
        if (!item) return null;
        
        // Ensure weight is a positive number
        const validValue = typeof item.value === 'number' && item.value > 0 ? 
          item.value : (item.value <= 0 ? 100 : item.value);
          
        return {
          ...item,
          value: validValue
        };
      }).filter(Boolean); // Remove null entries
    }
    
    return validatedData;
  };
  
  // Fetch exercise recommendations when body part filter changes
  useEffect(() => {
    if (!loading && !error && analyticsData) {
      fetchExerciseRecommendations(analyticsData, bodyPartFilter);
    }
  }, [bodyPartFilter]);

  // Function to fetch AI insights
  const fetchAiInsights = async (data) => {
    try {
      setInsightsLoading(true);
      const insights = await generateFitnessInsights(data);
      setAiInsights(insights);
    } catch (err) {
      console.error("Error fetching AI insights:", err);
      // Set default insights in case of error
      setAiInsights({
        performancePatterns: "Your workouts are most effective on weekday mornings. Schedule high-intensity sessions between 7-9am for optimal results.",
        recoveryAnalysis: "You're showing signs of needing additional recovery time. Consider adding an extra rest day this week.",
        nutritionImpact: "Your performance drops on days with less than 100g of protein intake. Consider increasing protein consumption."
      });
    } finally {
      setInsightsLoading(false);
    }
  };

  // Function to fetch exercise recommendations
  const fetchExerciseRecommendations = async (data, bodyPart) => {
    try {
      setExercisesLoading(true);
      const userId = localStorage.getItem("userId");
      const userDataResponse = await fetch(`http://localhost:3000/api/user/${userId}`);
      
      if (!userDataResponse.ok) {
        throw new Error("Failed to fetch user data");
      }
      
      const userData = await userDataResponse.json();
      
      // Combine user data with analytics for better recommendations
      const combinedData = {
        userData,
        analyticsData: data
      };
      
      const recommendations = await generateExerciseRecommendations(combinedData, bodyPart);
      setRecommendedExercises(recommendations);
    } catch (err) {
      console.error("Error fetching exercise recommendations:", err);
      // Set default recommendations in case of error
      setRecommendedExercises([
        {
          title: "Bulgarian Split Squats",
          bodyPart: "Legs",
          type: "Strength",
          level: "Intermediate",
          description: "Great unilateral exercise for developing leg strength and balance. Targets quads, glutes, and hamstrings effectively.",
          youtube_video: "https://www.youtube.com/watch?v=2C-uNgKwPLE"
        },
        {
          title: "Incline Dumbbell Press",
          bodyPart: "Chest",
          type: "Strength",
          level: "Intermediate",
          description: "Targets the upper chest muscles more effectively than flat bench press. Good for developing chest definition.",
          youtube_video: "https://www.youtube.com/watch?v=8iPEnn-ltC8"
        },
        {
          title: "Kettlebell Swings",
          bodyPart: "Full Body",
          type: "Cardio/Strength",
          level: "Beginner",
          description: "Excellent exercise for cardiovascular fitness and posterior chain development. Burns calories while building strength.",
          youtube_video: "https://www.youtube.com/watch?v=YSxHifyI6s8"
        }
      ]);
    } finally {
      setExercisesLoading(false);
    }
  };

  // Get time data based on selected metric
  const getTimeData = () => {
    if (loading || error) return [];
    
    switch (selectedMetric) {
      case "calories":
        return analyticsData.calories;
      case "exerciseTime":
        return analyticsData.exerciseTime;
      case "weight":
        return analyticsData.weight;
      default:
        return [];
    }
  };

  // Get filtered exercises based on selected body part
  const getFilteredExercises = () => {
    if (exercisesLoading) {
      return [{ title: "Loading recommendations..." }];
    }
    
    if (recommendedExercises.length === 0) {
      return [{ title: "No recommendations available for this filter." }];
    }
    
    return recommendedExercises;
  };

  // Calculate weight prediction message
  const getWeightPredictionMessage = () => {
    if (!analyticsData.predictiveWeight || analyticsData.predictiveWeight.length < 2) {
      return "Continue tracking your weight to see future predictions.";
    }
    
    const actualWeights = analyticsData.predictiveWeight.filter(item => !item.isPrediction);
    const predictions = analyticsData.predictiveWeight.filter(item => item.isPrediction);
    
    if (actualWeights.length === 0 || predictions.length === 0) {
      return "Keep logging your weight to see personalized predictions.";
    }
    
    const latestActual = actualWeights[actualWeights.length - 1];
    const latestPrediction = predictions[predictions.length - 1];
    const weightDiff = Math.abs(latestPrediction.value - latestActual.value).toFixed(1);
    
    if (latestPrediction.value < latestActual.value) {
      return `Based on your current activity and progress, you could lose approximately ${weightDiff} lbs in the next 4 weeks.`;
    } else if (latestPrediction.value > latestActual.value) {
      return `Based on your current activity and progress, you may gain approximately ${weightDiff} lbs in the next 4 weeks.`;
    } else {
      return "Your weight is predicted to remain stable over the next 4 weeks.";
    }
  };

  // Colors for charts
  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#0088FE",
    "#00C49F",
  ];

  // Custom tooltip for weight prediction chart
  const PredictiveWeightTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label">{`Date: ${label}`}</p>
          <p className="weight">{`Weight: ${payload[0].value.toFixed(1)} lbs`}</p>
          {data.isPrediction && <p className="prediction-note">Predicted value</p>}
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="loading">Loading analytics data...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="app-container">
      <div className="nav-wrapper">
        <Nav purchasedPlans={purchasedPlans} />
      </div>
      <div className="analytics-dashboard">
        <h1>Analytics Dashboard</h1>

        <div className="dashboard-controls">
          <div className="control-group">
            <label>Time Frame:</label>
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>

          <div className="control-group">
            <label>Metric:</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
            >
              <option value="calories">Calories Burned</option>
              <option value="exerciseTime">Exercise Time</option>
              <option value="weight">Weight</option>
            </select>
          </div>

          <div className="control-group">
            <label>Body Part:</label>
            <select
              value={bodyPartFilter}
              onChange={(e) => setBodyPartFilter(e.target.value)}
            >
              <option value="All">All</option>
              {analyticsData.bodyPartDistribution.map((part) => (
                <option key={part.name} value={part.name}>
                  {part.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="card trend-analysis">
            <h2>Trend Analysis</h2>
            <p className="insight-text">
              {selectedMetric === "weight"
                ? analyticsData.weight && analyticsData.weight.length >= 2
                  ? `You've ${analyticsData.weight[analyticsData.weight.length - 1].value < analyticsData.weight[0].value 
                     ? "lost" : "gained"} weight since you started tracking.`
                  : "Start tracking your weight to see trends."
                : "Your performance is improving consistently. Keep up the good work!"}
            </p>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={getTimeData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  name={
                    selectedMetric === "weight"
                      ? "Weight (lbs)"
                      : selectedMetric === "calories"
                      ? "Calories Burned"
                      : "Exercise Time (min)"
                  }
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card predictive-analysis">
            <h2>Predictive Analysis</h2>
            <p className="insight-text">
              {getWeightPredictionMessage()}
            </p>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart 
                data={analyticsData.predictiveWeight}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis 
                  domain={['auto', 'auto']} 
                  width={40}
                  tickFormatter={(value) => value.toFixed(0)}
                />
                <Tooltip content={<PredictiveWeightTooltip />} />
                <Legend />
                <defs>
                  <linearGradient
                    id="actualGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="predictGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey={(d) => (!d.isPrediction ? d.value : null)}
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#actualGradient)"
                  name="Actual Weight"
                  activeDot={{ r: 8 }}
                  connectNulls
                />
                <Area
                  type="monotone"
                  dataKey={(d) => (d.isPrediction ? d.value : null)}
                  stroke="#82ca9d"
                  strokeDasharray="5 5"
                  fillOpacity={1}
                  fill="url(#predictGradient)"
                  name="Predicted Weight"
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card body-part-distribution">
            <h2>Body Part Focus Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analyticsData.bodyPartDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {analyticsData.bodyPartDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card difficulty-distribution">
            <h2>Exercise Difficulty Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analyticsData.difficultyDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" name="Exercise Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card exercise-recommendations">
          <h2>Exercise Recommendations</h2>
          <p className="insight-text">
            Based on your activity patterns, we recommend trying these
            exercises:
          </p>
          <div className="exercise-list">
            {exercisesLoading ? (
              <div className="loading-exercises">Loading recommendations...</div>
            ) : (
              getFilteredExercises()
                .slice(0, 3)
                .map((exercise, index) => (
                  <div key={index} className="exercise-card">
                    <h3>{exercise.title}</h3>
                    {exercise.bodyPart && (
                      <p className="exercise-meta">
                        <span className="badge">{exercise.bodyPart}</span>
                        <span className="badge">{exercise.type}</span>
                        <span className="badge">{exercise.level}</span>
                      </p>
                    )}
                    {exercise.description && (
                      <p className="exercise-description">{exercise.description}</p>
                    )}
                    {exercise.youtube_video && (
                      <a
                        href={exercise.youtube_video}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="watch-link"
                      >
                        Watch Tutorial
                      </a>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>

        <div className="card ai-insights">
          <h2>AI Fitness Insights</h2>
          <div className="insights-container">
            {insightsLoading ? (
              <div className="loading-insights">Loading AI insights...</div>
            ) : (
              <>
                <div className="insight-item">
                  <h3>Performance Patterns</h3>
                  <p>{aiInsights.performancePatterns}</p>
                </div>
                <div className="insight-item">
                  <h3>Recovery Analysis</h3>
                  <p>{aiInsights.recoveryAnalysis}</p>
                </div>
                <div className="insight-item">
                  <h3>Nutrition Impact</h3>
                  <p>{aiInsights.nutritionImpact}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
// import React, { useState, useEffect } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   PieChart,
//   Pie,
//   Cell,
//   LineChart,
//   Line,
//   ResponsiveContainer,
//   AreaChart,
//   Area,
// } from "recharts";
// import "../styles/AnalyticsDashboard.css";
// import Nav from "./Nav";
// import { 
//   generateFitnessInsights, 
//   generateExerciseRecommendations 
// } from "./OpenRouter/NVIDIA_Api"; // Import API functions

// const AnalyticsDashboard = ({ userData }) => {
//   const [timeFrame, setTimeFrame] = useState("weekly");
//   const [selectedMetric, setSelectedMetric] = useState("calories");
//   const [bodyPartFilter, setBodyPartFilter] = useState("All");
//   const [purchasedPlans, setPurchasedPlans] = useState(() => {
//     const savedPlans = localStorage.getItem("purchasedPlans");
//     return savedPlans ? JSON.parse(savedPlans) : [];
//   });
  
//   // Analytics data state
//   const [analyticsData, setAnalyticsData] = useState({
//     calories: [],
//     exerciseTime: [],
//     weight: [],
//     bodyPartDistribution: [],
//     difficultyDistribution: [],
//     predictiveWeight: [],
//     exerciseRecommendations: [],
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // State for AI insights and recommended exercises
//   const [aiInsights, setAiInsights] = useState({
//     performancePatterns: "",
//     recoveryAnalysis: "",
//     nutritionImpact: ""
//   });
//   const [recommendedExercises, setRecommendedExercises] = useState([]);
//   const [insightsLoading, setInsightsLoading] = useState(false);
//   const [exercisesLoading, setExercisesLoading] = useState(false);

//   // Fetch analytics data from the API
//   useEffect(() => {
//     const fetchAnalyticsData = async () => {
//       try {
//         setLoading(true);
//         // Get the userId from localStorage or context
//         const userId = localStorage.getItem("userId");
        
//         if (!userId) {
//           setError("User ID not found. Please log in.");
//           setLoading(false);
//           return;
//         }
        
//         const response = await fetch(`http://localhost:3000/api/analytics?userId=${userId}&timeFrame=${timeFrame}`, {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//           },
//         });
        
//         if (!response.ok) {
//           throw new Error("Failed to fetch analytics data");
//         }
        
//         const data = await response.json();
//         setAnalyticsData(data);
//         setLoading(false);
        
//         // After getting analytics data, fetch AI insights and recommendations
//         fetchAiInsights(data);
//         fetchExerciseRecommendations(data, bodyPartFilter);
//       } catch (err) {
//         console.error("Error fetching analytics data:", err);
//         setError(err.message);
//         setLoading(false);
//       }
//     };
    
//     fetchAnalyticsData();
//   }, [timeFrame]); // Re-fetch when timeFrame changes
  
//   // Fetch exercise recommendations when body part filter changes
//   useEffect(() => {
//     if (!loading && !error && analyticsData) {
//       fetchExerciseRecommendations(analyticsData, bodyPartFilter);
//     }
//   }, [bodyPartFilter]);

//   // Function to fetch AI insights
//   const fetchAiInsights = async (data) => {
//     try {
//       setInsightsLoading(true);
//       const insights = await generateFitnessInsights(data);
//       setAiInsights(insights);
//     } catch (err) {
//       console.error("Error fetching AI insights:", err);
//       // Set default insights in case of error
//       setAiInsights({
//         performancePatterns: "Your workouts are most effective on weekday mornings. Schedule high-intensity sessions between 7-9am for optimal results.",
//         recoveryAnalysis: "You're showing signs of needing additional recovery time. Consider adding an extra rest day this week.",
//         nutritionImpact: "Your performance drops on days with less than 100g of protein intake. Consider increasing protein consumption."
//       });
//     } finally {
//       setInsightsLoading(false);
//     }
//   };

//   // Function to fetch exercise recommendations
//   const fetchExerciseRecommendations = async (data, bodyPart) => {
//     try {
//       setExercisesLoading(true);
//       const userId = localStorage.getItem("userId");
//       const userDataResponse = await fetch(`http://localhost:3000/api/user/${userId}`);
      
//       if (!userDataResponse.ok) {
//         throw new Error("Failed to fetch user data");
//       }
      
//       const userData = await userDataResponse.json();
      
//       // Combine user data with analytics for better recommendations
//       const combinedData = {
//         userData,
//         analyticsData: data
//       };
      
//       const recommendations = await generateExerciseRecommendations(combinedData, bodyPart);
//       setRecommendedExercises(recommendations);
//     } catch (err) {
//       console.error("Error fetching exercise recommendations:", err);
//       // Set default recommendations in case of error
//       setRecommendedExercises([
//         {
//           title: "Bulgarian Split Squats",
//           bodyPart: "Legs",
//           type: "Strength",
//           level: "Intermediate",
//           description: "Great unilateral exercise for developing leg strength and balance. Targets quads, glutes, and hamstrings effectively.",
//           youtube_video: "https://www.youtube.com/watch?v=2C-uNgKwPLE"
//         },
//         {
//           title: "Incline Dumbbell Press",
//           bodyPart: "Chest",
//           type: "Strength",
//           level: "Intermediate",
//           description: "Targets the upper chest muscles more effectively than flat bench press. Good for developing chest definition.",
//           youtube_video: "https://www.youtube.com/watch?v=8iPEnn-ltC8"
//         },
//         {
//           title: "Kettlebell Swings",
//           bodyPart: "Full Body",
//           type: "Cardio/Strength",
//           level: "Beginner",
//           description: "Excellent exercise for cardiovascular fitness and posterior chain development. Burns calories while building strength.",
//           youtube_video: "https://www.youtube.com/watch?v=YSxHifyI6s8"
//         }
//       ]);
//     } finally {
//       setExercisesLoading(false);
//     }
//   };

//   // Get time data based on selected metric
//   const getTimeData = () => {
//     if (loading || error) return [];
    
//     switch (selectedMetric) {
//       case "calories":
//         return analyticsData.calories;
//       case "exerciseTime":
//         return analyticsData.exerciseTime;
//       case "weight":
//         return analyticsData.weight;
//       default:
//         return [];
//     }
//   };

//   // Get filtered exercises based on selected body part
//   const getFilteredExercises = () => {
//     if (exercisesLoading) {
//       return [{ title: "Loading recommendations..." }];
//     }
    
//     if (recommendedExercises.length === 0) {
//       return [{ title: "No recommendations available for this filter." }];
//     }
    
//     return recommendedExercises;
//   };

//   // Colors for charts
//   const COLORS = [
//     "#8884d8",
//     "#82ca9d",
//     "#ffc658",
//     "#ff8042",
//     "#0088FE",
//     "#00C49F",
//   ];

//   if (loading) return <div className="loading">Loading analytics data...</div>;
//   if (error) return <div className="error">Error: {error}</div>;

//   return (
//     <div className="app-container">
//       <div className="nav-wrapper">
//         <Nav purchasedPlans={purchasedPlans} />
//       </div>
//       <div className="analytics-dashboard">
//         <h1>Analytics Dashboard</h1>

//         <div className="dashboard-controls">
//           <div className="control-group">
//             <label>Time Frame:</label>
//             <select
//               value={timeFrame}
//               onChange={(e) => setTimeFrame(e.target.value)}
//             >
//               <option value="weekly">Weekly</option>
//               <option value="monthly">Monthly</option>
//               <option value="quarterly">Quarterly</option>
//             </select>
//           </div>

//           <div className="control-group">
//             <label>Metric:</label>
//             <select
//               value={selectedMetric}
//               onChange={(e) => setSelectedMetric(e.target.value)}
//             >
//               <option value="calories">Calories Burned</option>
//               <option value="exerciseTime">Exercise Time</option>
//               <option value="weight">Weight</option>
//             </select>
//           </div>

//           <div className="control-group">
//             <label>Body Part:</label>
//             <select
//               value={bodyPartFilter}
//               onChange={(e) => setBodyPartFilter(e.target.value)}
//             >
//               <option value="All">All</option>
//               {analyticsData.bodyPartDistribution.map((part) => (
//                 <option key={part.name} value={part.name}>
//                   {part.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div className="dashboard-grid">
//           <div className="card trend-analysis">
//             <h2>Trend Analysis</h2>
//             <p className="insight-text">
//               {selectedMetric === "weight"
//                 ? analyticsData.weight && analyticsData.weight.length >= 2
//                   ? `You've ${analyticsData.weight[analyticsData.weight.length - 1].value < analyticsData.weight[0].value 
//                      ? "lost" : "gained"} weight since you started tracking.`
//                   : "Start tracking your weight to see trends."
//                 : "Your performance is improving consistently. Keep up the good work!"}
//             </p>
//             <ResponsiveContainer width="100%" height={250}>
//               <LineChart data={getTimeData()}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="date" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Line
//                   type="monotone"
//                   dataKey="value"
//                   stroke="#8884d8"
//                   activeDot={{ r: 8 }}
//                   name={
//                     selectedMetric === "weight"
//                       ? "Weight (lbs)"
//                       : selectedMetric === "calories"
//                       ? "Calories Burned"
//                       : "Exercise Time (min)"
//                   }
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>

//           <div className="card predictive-analysis">
//             <h2>Predictive Analysis</h2>
//             <p className="insight-text">
//               Based on your current progress, here's what you can expect in the
//               coming weeks:
//             </p>
//             <ResponsiveContainer width="100%" height={250}>
//               <AreaChart data={analyticsData.predictiveWeight}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="date" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <defs>
//                   <linearGradient
//                     id="actualGradient"
//                     x1="0"
//                     y1="0"
//                     x2="0"
//                     y2="1"
//                   >
//                     <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
//                     <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
//                   </linearGradient>
//                   <linearGradient
//                     id="predictGradient"
//                     x1="0"
//                     y1="0"
//                     x2="0"
//                     y2="1"
//                   >
//                     <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
//                     <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
//                   </linearGradient>
//                 </defs>
//                 <Area
//                   type="monotone"
//                   dataKey={(d) => (!d.isPrediction ? d.value : null)}
//                   stroke="#8884d8"
//                   fillOpacity={1}
//                   fill="url(#actualGradient)"
//                   name="Actual Weight"
//                   activeDot={{ r: 8 }}
//                   connectNulls
//                 />
//                 <Area
//                   type="monotone"
//                   dataKey={(d) => (d.isPrediction ? d.value : null)}
//                   stroke="#82ca9d"
//                   strokeDasharray="5 5"
//                   fillOpacity={1}
//                   fill="url(#predictGradient)"
//                   name="Predicted Weight"
//                 />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>

//           <div className="card body-part-distribution">
//             <h2>Body Part Focus Distribution</h2>
//             <ResponsiveContainer width="100%" height={250}>
//               <PieChart>
//                 <Pie
//                   data={analyticsData.bodyPartDistribution}
//                   cx="50%"
//                   cy="50%"
//                   labelLine={false}
//                   outerRadius={80}
//                   fill="#8884d8"
//                   dataKey="value"
//                   nameKey="name"
//                   label={({ name, percent }) =>
//                     `${name}: ${(percent * 100).toFixed(0)}%`
//                   }
//                 >
//                   {analyticsData.bodyPartDistribution.map((entry, index) => (
//                     <Cell
//                       key={`cell-${index}`}
//                       fill={COLORS[index % COLORS.length]}
//                     />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>

//           <div className="card difficulty-distribution">
//             <h2>Exercise Difficulty Distribution</h2>
//             <ResponsiveContainer width="100%" height={250}>
//               <BarChart data={analyticsData.difficultyDistribution}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="value" fill="#82ca9d" name="Exercise Count" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         <div className="card exercise-recommendations">
//           <h2>Exercise Recommendations</h2>
//           <p className="insight-text">
//             Based on your activity patterns, we recommend trying these
//             exercises:
//           </p>
//           <div className="exercise-list">
//             {exercisesLoading ? (
//               <div className="loading-exercises">Loading recommendations...</div>
//             ) : (
//               getFilteredExercises()
//                 .slice(0, 3)
//                 .map((exercise, index) => (
//                   <div key={index} className="exercise-card">
//                     <h3>{exercise.title}</h3>
//                     {exercise.bodyPart && (
//                       <p className="exercise-meta">
//                         <span className="badge">{exercise.bodyPart}</span>
//                         <span className="badge">{exercise.type}</span>
//                         <span className="badge">{exercise.level}</span>
//                       </p>
//                     )}
//                     {exercise.description && (
//                       <p className="exercise-description">{exercise.description}</p>
//                     )}
//                     {exercise.youtube_video && (
//                       <a
//                         href={exercise.youtube_video}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="watch-link"
//                       >
//                         Watch Tutorial
//                       </a>
//                     )}
//                   </div>
//                 ))
//             )}
//           </div>
//         </div>

//         <div className="card ai-insights">
//           <h2>AI Fitness Insights</h2>
//           <div className="insights-container">
//             {insightsLoading ? (
//               <div className="loading-insights">Loading AI insights...</div>
//             ) : (
//               <>
//                 <div className="insight-item">
//                   <h3>Performance Patterns</h3>
//                   <p>{aiInsights.performancePatterns}</p>
//                 </div>
//                 <div className="insight-item">
//                   <h3>Recovery Analysis</h3>
//                   <p>{aiInsights.recoveryAnalysis}</p>
//                 </div>
//                 <div className="insight-item">
//                   <h3>Nutrition Impact</h3>
//                   <p>{aiInsights.nutritionImpact}</p>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AnalyticsDashboard;