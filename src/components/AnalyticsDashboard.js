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
      const savedPlans = localStorage.getItem('purchasedPlans');
      return savedPlans ? JSON.parse(savedPlans) : [];
    });
    

  // Example user data structure (would be passed as props in real app)
  const userDataExample = userData || {
    weight: [
      { date: "2025-02-01", value: 180 },
      { date: "2025-02-08", value: 178 },
      { date: "2025-02-15", value: 176 },
      { date: "2025-02-22", value: 175 },
      { date: "2025-03-01", value: 173 },
      { date: "2025-03-08", value: 172 },
    ],
    calories: [
      { date: "2025-03-01", value: 350 },
      { date: "2025-03-02", value: 400 },
      { date: "2025-03-03", value: 320 },
      { date: "2025-03-04", value: 500 },
      { date: "2025-03-05", value: 450 },
      { date: "2025-03-06", value: 280 },
      { date: "2025-03-07", value: 600 },
    ],
    exerciseTime: [
      { date: "2025-03-01", value: 45 },
      { date: "2025-03-02", value: 60 },
      { date: "2025-03-03", value: 30 },
      { date: "2025-03-04", value: 75 },
      { date: "2025-03-05", value: 60 },
      { date: "2025-03-06", value: 20 },
      { date: "2025-03-07", value: 90 },
    ],
    exercisesByBodyPart: {
      Abdominals: [
        {
          title: "Partner plank band row",
          description:
            "The partner plank band row is an abdominal exercise where two partners perform single-arm planks while pulling on the opposite ends of an exercise band.",
          type: "Strength",
          equipment: "Bands",
          level: "Intermediate",
          count: 5,
        },
        {
          title: "Banded crunch isometric hold",
          description:
            "The banded crunch isometric hold is an exercise targeting the abdominal muscles.",
          type: "Strength",
          equipment: "Bands",
          level: "Intermediate",
          count: 8,
        },
      ],
      Chest: [
        {
          title: "Bench Press",
          description: "Classic chest exercise",
          type: "Strength",
          equipment: "Barbell",
          level: "Beginner",
          count: 12,
        },
      ],
      Legs: [
        {
          title: "Squats",
          description: "Compound leg exercise",
          type: "Strength",
          equipment: "Bodyweight",
          level: "Beginner",
          count: 15,
        },
      ],
    },
  };

  // Process data for body part distribution chart
  const getBodyPartData = () => {
    const data = [];
    let total = 0;

    Object.keys(userDataExample.exercisesByBodyPart).forEach((bodyPart) => {
      const count = userDataExample.exercisesByBodyPart[bodyPart].reduce(
        (sum, exercise) => sum + (exercise.count || 0),
        0
      );
      total += count;
      data.push({ name: bodyPart, value: count });
    });

    return data;
  };

  // Process exercise time data based on selected timeframe
  const getTimeData = () => {
    const data = userDataExample[selectedMetric] || [];

    if (timeFrame === "weekly") {
      return data.slice(-7);
    } else if (timeFrame === "monthly") {
      return data.slice(-30);
    } else {
      return data.slice(-90);
    }
  };

  // Generate predictive data based on current trends
  const getPredictiveData = () => {
    const data = userDataExample.weight;
    if (data.length < 2) return [];

    const lastValue = data[data.length - 1].value;
    const previousValue = data[data.length - 2].value;
    const trend = lastValue - previousValue;

    // Create next 4 predicted points
    const predictions = [];
    for (let i = 1; i <= 4; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i * 7);
      predictions.push({
        date: date.toISOString().split("T")[0],
        value: Math.max(lastValue - trend * i, 0), // Prevent negative weights
        isPrediction: true,
      });
    }

    return [...data, ...predictions];
  };

  // Calculate exercise difficulty distribution
  const getDifficultyDistribution = () => {
    const difficulties = { Beginner: 0, Intermediate: 0, Advanced: 0 };

    Object.keys(userDataExample.exercisesByBodyPart).forEach((bodyPart) => {
      userDataExample.exercisesByBodyPart[bodyPart].forEach((exercise) => {
        if (difficulties.hasOwnProperty(exercise.level)) {
          difficulties[exercise.level] += exercise.count || 1;
        }
      });
    });

    return Object.keys(difficulties).map((level) => ({
      name: level,
      value: difficulties[level],
    }));
  };

  // Get filtered exercises based on selected body part
  const getFilteredExercises = () => {
    if (bodyPartFilter === "All") {
      const allExercises = [];
      Object.keys(userDataExample.exercisesByBodyPart).forEach((bodyPart) => {
        userDataExample.exercisesByBodyPart[bodyPart].forEach((exercise) => {
          allExercises.push({ ...exercise, bodyPart });
        });
      });
      return allExercises;
    } else {
      return (
        userDataExample.exercisesByBodyPart[bodyPartFilter]?.map(
          (exercise) => ({
            ...exercise,
            bodyPart: bodyPartFilter,
          })
        ) || []
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

  return (
    <div className="app-container">
      <div className="nav-wrapper">
        <Nav purchasedPlans={purchasedPlans}/>
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
              {Object.keys(userDataExample.exercisesByBodyPart).map((part) => (
                <option key={part} value={part}>
                  {part}
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
                ? "You are on track to reach your target weight in approximately 4 weeks."
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
              <AreaChart data={getPredictiveData()}>
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
                  dataKey="value"
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
                  data={getBodyPartData()}
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
                  {getBodyPartData().map((entry, index) => (
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
              <BarChart data={getDifficultyDistribution()}>
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
