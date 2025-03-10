import React, { useState, useEffect } from "react";
import homepageimg2 from "../assets/homepageimg2.jpg";
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
import NutritionVisualization from "./NutritionVisualization";
const mockProgressData = [
  {
    month: "Jan",
    weight: 180,
    steps: 5000,
    calories: 2200,
    workoutDuration: 45,
  },
  {
    month: "Feb",
    weight: 175,
    steps: 6000,
    calories: 2100,
    workoutDuration: 60,
  },
  {
    month: "Mar",
    weight: 170,
    steps: 7000,
    calories: 2000,
    workoutDuration: 75,
  },
  {
    month: "Apr",
    weight: 168,
    steps: 8000,
    calories: 1900,
    workoutDuration: 90,
  },
  {
    month: "May",
    weight: 165,
    steps: 8500,
    calories: 1850,
    workoutDuration: 95,
  },
  {
    month: "Jun",
    weight: 163,
    steps: 9000,
    calories: 1800,
    workoutDuration: 100,
  },
  {
    month: "Jul",
    weight: 160,
    steps: 9500,
    calories: 1750,
    workoutDuration: 105,
  },
];

const weeklyActivityData = [
  { day: "Mon", minutes: 30 },
  { day: "Tue", minutes: 45 },
  { day: "Wed", minutes: 25 },
  { day: "Thu", minutes: 60 },
  { day: "Fri", minutes: 90 },
  { day: "Sat", minutes: 20 },
  { day: "Sun", minutes: 15 },
];

const workoutTypeData = [
  { name: "Cardio", value: 30 },
  { name: "Stretching", value: 40 },
  { name: "Weights", value: 15 },
  { name: "Strength", value: 25 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const FitnessDashboard = () => {
  const [selectedMetrics, setSelectedMetrics] = useState({
    weight: true,
    steps: true,
    calories: true,
    workoutDuration: false,
  });

  const [chartType, setChartType] = useState("bar");

  const toggleMetric = (metric) => {
    setSelectedMetrics((prev) => ({
      ...prev,
      [metric]: !prev[metric],
    }));
  };

  const getVisibleMetrics = () => {
    return Object.keys(selectedMetrics).filter(
      (metric) => selectedMetrics[metric]
    );
  };

  const renderTopMetrics = () => {
    const latestData = mockProgressData[mockProgressData.length - 1];
    return (
      <div className="top-metrics">
        <div className="metric-card weight">
          <span className="metric-icon">⚖️</span>
          <div className="metric-content">
            <h3>Weight</h3>
            <div className="metric-value">{latestData.weight} lbs</div>
            <div className="metric-progress">11% decrease since start</div>
          </div>
        </div>

        <div className="metric-card steps">
          <span className="metric-icon">👣</span>
          <div className="metric-content">
            <h3>Steps</h3>
            <div className="metric-value">
              {latestData.steps.toLocaleString()}
            </div>
            <div className="metric-progress">50% of your goal</div>
          </div>
        </div>

        <div className="metric-card calories">
          <span className="metric-icon">💦</span>
          <div className="metric-content">
            <h3>Calories</h3>
            <div className="calories-gauge">
              <span>{latestData.calories}</span>
              <span>Intake</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMonthlyProgress = () => {
    return (
      <div className="monthly-progress">
        <h3>Monthly Progress</h3>
        <div className="progress-circle-container">
          <div className="big-progress-circle">
            <span className="progress-percentage">80%</span>
          </div>
          <div className="progress-text">
            You have achieved 80% of your goal this month.
          </div>
        </div>
      </div>
    );
  };

  const renderActivityChart = () => {
    return (
      <div className="activity-section">
        <div className="section-header">
          <h3>Activity</h3>
          <div className="period-selector">
            <span>Weekly</span>
            <span className="dropdown-icon">▼</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyActivityData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} />
            <YAxis hide={true} />
            <Tooltip />
            <Bar dataKey="minutes" fill="#FF8042" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderProgressDonut = () => {
    return (
      <div className="progress-section">
        <div className="section-header">
          <h3>Progress</h3>
          <div className="period-selector">
            <span>Weekly</span>
            <span className="dropdown-icon">▼</span>
          </div>
        </div>
        <div className="donut-container">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={workoutTypeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {workoutTypeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center">
            <span>40</span>
            <span>hrs</span>
          </div>
          <div className="workout-types">
            {workoutTypeData.map((type, index) => (
              <div key={index} className="workout-type">
                <span
                  className="type-dot"
                  style={{ backgroundColor: COLORS[index] }}
                ></span>
                <span className="type-name">{type.name}</span>
                <span className="type-value">{type.value} hrs</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  const [purchasedPlans, setPurchasedPlans] = useState(() => {
    const savedPlans = localStorage.getItem("purchasedPlans");
    return savedPlans ? JSON.parse(savedPlans) : [];
  });

  useEffect(() => {
    localStorage.setItem("purchasedPlans", JSON.stringify(purchasedPlans));
  }, [purchasedPlans]);
  return (
    <div className="app-container">
      {/* Move Nav component outside the dashboard content */}
      <Nav purchasedPlans={purchasedPlans} />
      <div className="dashboard-container dashboard-wrapper-new">
        <div className="dashboard-header">
          <div className="greeting-section">
            <h2>Welcome Back ⭐</h2>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="main-content">
            <div className="center-content">
              {renderTopMetrics()}

              <div className="dashboard-grid">
                <div className="grid-item activity">
                  {renderActivityChart()}
                </div>
                <div className="grid-item progress">
                  {renderProgressDonut()}
                </div>
                <div className="grid-item progress">
                  <div className="nutrition-visualization-section">
                    <h2>Track Your Nutrition Journey</h2>
                    <p className="section-description">
                      Monitor your calorie intake and macro distribution with
                      our intuitive visualizations
                    </p>
                    <div className="nutrition-visualization-wrapper">
                      <NutritionVisualization />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="right-sidebar">{renderMonthlyProgress()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FitnessDashboard;
