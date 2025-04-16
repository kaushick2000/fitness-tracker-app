// Dashboard.js
import React, { useState, useEffect } from "react";
import Nav from "../components/Nav";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "../styles/CombinedDashboard.css";
import { fetchDashboardData } from "./utils/dashboardService";
import { generateDashboardInsights } from "./OpenRouter/NVIDIA_Api"; // Import the new function

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    topMetrics: null,
    progressData: [],
    weeklyActivityData: [],
    workoutTypeData: [],
    aiInsights: [],
    userData: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetrics, setSelectedMetrics] = useState({
    weight: true,
    steps: true,
    calories: true,
    workoutDuration: false,
  });
  const [chartType, setChartType] = useState("bar");
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Fetch dashboard data on component mount
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const userId = localStorage.getItem("userId") || "1"; // Default to user ID 1 if none stored
        const data = await fetchDashboardData(userId);
        setDashboardData(data);
        setLoading(false);
        
        // After getting dashboard data, fetch AI insights
        try {
          setInsightsLoading(true);
          const insights = await generateDashboardInsights(data.userData || data);
          console.log(insights)
          setDashboardData(prevData => ({
            ...prevData,
            aiInsights: insights
          }));
          setInsightsLoading(false);
        } catch (insightErr) {
          console.error("Failed to load AI insights:", insightErr);
          setInsightsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const toggleMetric = (metric) => {
    setSelectedMetrics((prev) => ({
      ...prev,
      [metric]: !prev[metric],
    }));
  };

  const getVisibleMetrics = () =>
    Object.keys(selectedMetrics).filter((metric) => selectedMetrics[metric]);

  const renderTopMetrics = () => {
    if (loading) return <div className="loading">Loading metrics...</div>;

    const { topMetrics } = dashboardData;
    // console.log(topMetrics)

    return (
      <div className="top-metrics">
        <div className="metric-card weight">
          <div className="metric-content">
            <h3>Weight</h3>
            <div className="metric-value">
              {topMetrics.weight.value} {topMetrics.weight.unit}
            </div>
          </div>
        </div>
        <div className="metric-card steps">
          <div className="metric-content">
            <h3>Steps</h3>
            <div className="metric-value">{topMetrics.steps.value}</div>
          </div>
        </div>
        <div className="metric-card calories">
          <div className="metric-content">
            <h3>Calories</h3>
            <div className="metric-value">
              {topMetrics.calories.value} {topMetrics.calories.unit}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAIInsights = () => {
    if (loading || insightsLoading) return <div className="loading">Loading insights...</div>;

    const { aiInsights } = dashboardData;

    return (
      <div className="ai-insights">
        <h3>AI Insights</h3>
        <ul>
          {aiInsights.map((insight, index) => (
            <li key={index}>{insight}</li>
          ))}
        </ul>
        <button 
          className="refresh-insights-button"
          onClick={async () => {
            setInsightsLoading(true);
            try {
              const freshInsights = await generateDashboardInsights(dashboardData.userData || dashboardData);
              setDashboardData(prevData => ({
                ...prevData,
                aiInsights: freshInsights
              }));
            } catch (e) {
              console.error("Error refreshing insights:", e);
            }
            setInsightsLoading(false);
          }}
        >
          {insightsLoading ? 'Loading...' : 'Refresh Insights'}
        </button>
      </div>
    );
  };

  const renderChart = () => {
    if (loading) return <div className="loading">Loading chart...</div>;

    const { progressData } = dashboardData;
    const visibleMetrics = getVisibleMetrics();

    if (chartType === "bar") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            {visibleMetrics.map((metric) => (
              <Bar
                key={metric}
                dataKey={metric}
                fill={COLORS[visibleMetrics.indexOf(metric) % COLORS.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={progressData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          {visibleMetrics.map((metric) => (
            <Line
              key={metric}
              type="monotone"
              dataKey={metric}
              stroke={COLORS[visibleMetrics.indexOf(metric) % COLORS.length]}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  if (error) {
    return (
      <div className="app-container">
        <Nav />
        <div className="error-container">
          <h2>Error loading dashboard</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Nav />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="greeting-section">
            <h2>
              Welcome to Your Fitness Dashboard
              {dashboardData.userData?.personalInfo?.firstName
                ? `, ${dashboardData.userData.personalInfo.firstName}`
                : ""}
            </h2>
            <p>Track your progress and stay motivated!</p>
          </div>
        </div>
        <div className="dashboard-content">
          {renderTopMetrics()}
          <div className="main-content">
            <div className="center-content">
              <div className="chart-section">
                <div className="chart-header">
                  <h2>Progress Over Time</h2>
                  <div className="chart-controls">
                    <label>
                      Chart Type:
                      <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                      >
                        <option value="bar">Bar</option>
                        <option value="line">Line</option>
                      </select>
                    </label>
                  </div>
                </div>
                <div className="chart-container">{renderChart()}</div>
              </div>
              <div className="insights-section">{renderAIInsights()}</div>
              <div className="monthly-progress">
                <h3>Weekly Activity</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dashboardData.weeklyActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="minutes" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
                
              </div>
            </div>
            <div className="right-sidebar">
              <div className="metrics-selector">
                <h2>Select Metrics</h2>
                <div className="metrics-grid">
                  {Object.keys(selectedMetrics).map((metric) => (
                    <label key={metric} className="metric-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedMetrics[metric]}
                        onChange={() => toggleMetric(metric)}
                      />
                      {metric.charAt(0).toUpperCase() +
                        metric.slice(1).replace(/([A-Z])/g, " $1")}
                    </label>
                  ))}
                </div>
              </div>
              <h3>Workout Types</h3>
                <PieChart width={200} height={200}>
                  <Pie
                    data={dashboardData.workoutTypeData}
                    cx={100}
                    cy={100}
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dashboardData.workoutTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;