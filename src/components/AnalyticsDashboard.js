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
        setAnalyticsData(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [timeFrame]); // Re-fetch when timeFrame changes

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
    if (loading || error || !analyticsData.exerciseRecommendations) return [];
    
    if (bodyPartFilter === "All") {
      return analyticsData.exerciseRecommendations;
    } else {
      return analyticsData.exerciseRecommendations.filter(
        exercise => exercise.bodyPart === bodyPartFilter
      );
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
                <YAxis />
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
              Based on your current progress, here's what you can expect in the
              coming weeks:
            </p>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analyticsData.predictiveWeight}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
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
            {getFilteredExercises()
              .slice(0, 3)
              .map((exercise, index) => (
                <div key={index} className="exercise-card">
                  <h3>{exercise.title}</h3>
                  <p className="exercise-meta">
                    <span className="badge">{exercise.bodyPart}</span>
                    <span className="badge">{exercise.type}</span>
                    <span className="badge">{exercise.level}</span>
                  </p>
                  <p className="exercise-description">{exercise.description}</p>
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
              ))}
          </div>
        </div>

        <div className="card ai-insights2">
          <h2>AI Fitness Insights</h2>
          <div className="insights-container">
            <div className="insight-item">
              <h3>Performance Patterns</h3>
              <p>
                Your workouts are most effective on weekday mornings. Schedule
                high-intensity sessions between 7-9am for optimal results.
              </p>
            </div>
            <div className="insight-item">
              <h3>Recovery Analysis</h3>
              <p>
                You're showing signs of needing additional recovery time.
                Consider adding an extra rest day this week.
              </p>
            </div>
            <div className="insight-item">
              <h3>Nutrition Impact</h3>
              <p>
                Your performance drops on days with less than 100g of protein
                intake. Consider increasing protein consumption.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;