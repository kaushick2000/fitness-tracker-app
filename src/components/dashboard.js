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

// import React, { useState } from 'react';
// import {
//   BarChart,
//   Bar,
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell
// } from 'recharts';
// import Nav from '../components/Nav';

// const mockProgressData = [
//   { month: 'Jan', weight: 180, steps: 5000, calories: 2200, workoutDuration: 45 },
//   { month: 'Feb', weight: 175, steps: 6000, calories: 2100, workoutDuration: 60 },
//   { month: 'Mar', weight: 170, steps: 7000, calories: 2000, workoutDuration: 75 },
//   { month: 'Apr', weight: 168, steps: 8000, calories: 1900, workoutDuration: 90 },
//   { month: 'May', weight: 165, steps: 8500, calories: 1850, workoutDuration: 95 },
//   { month: 'Jun', weight: 163, steps: 9000, calories: 1800, workoutDuration: 100 },
//   { month: 'Jul', weight: 160, steps: 9500, calories: 1750, workoutDuration: 105 },
// ];

// const weeklyActivityData = [
//   { day: 'Mon', minutes: 30 },
//   { day: 'Tue', minutes: 45 },
//   { day: 'Wed', minutes: 25 },
//   { day: 'Thu', minutes: 60 },
//   { day: 'Fri', minutes: 90 },
//   { day: 'Sat', minutes: 20 },
//   { day: 'Sun', minutes: 15 },
// ];

// const goalProgressData = [
//   { name: 'Running', value: 70 },
//   { name: 'Sleeping', value: 60 },
//   { name: 'Weight Loss', value: 50 },
// ];

// const workoutTypeData = [
//   { name: 'Cardio', value: 30 },
//   { name: 'Stretching', value: 40 },
//   { name: 'Weights', value: 15 },
//   { name: 'Strength', value: 25 },
// ];

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// const FitnessDashboard = () => {
//   const [selectedMetrics, setSelectedMetrics] = useState({
//     weight: true,
//     steps: true,
//     calories: true,
//     workoutDuration: false
//   });

//   const [chartType, setChartType] = useState('bar');

//   const toggleMetric = (metric) => {
//     setSelectedMetrics(prev => ({
//       ...prev,
//       [metric]: !prev[metric]
//     }));
//   };

//   const getVisibleMetrics = () => {
//     return Object.keys(selectedMetrics)
//       .filter(metric => selectedMetrics[metric]);
//   };

//   const renderTopMetrics = () => {
//     const latestData = mockProgressData[mockProgressData.length - 1];

//     return (
//       <div className="top-metrics">
//         <div className="metric-card steps">
//           <span className="metric-icon">👣</span>
//           <div className="metric-content">
//             <h3>Steps</h3>
//             <div className="metric-value">{latestData.steps.toLocaleString()}</div>
//             <div className="metric-progress">50% of your goals</div>
//           </div>
//         </div>

//         <div className="metric-card water">
//           <span className="metric-icon">💧</span>
//           <div className="metric-content">
//             <h3>Water</h3>
//             <div className="water-progress">
//               <div className="water-circle">
//                 <span>1.5</span>
//                 <span>Liters</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="metric-card calories">
//           <span className="metric-icon">🔥</span>
//           <div className="metric-content">
//             <h3>Calories</h3>
//             <div className="calories-gauge">
//               <span>{latestData.calories}</span>
//               <span>Intake</span>
//             </div>
//           </div>
//         </div>

//         <div className="metric-card heart-rate">
//           <span className="metric-icon">💓</span>
//           <div className="metric-content">
//             <h3>Heart Rate</h3>
//             <div className="heart-rate-chart">
//               <LineChart width={100} height={50} data={mockProgressData}>
//                 <Line type="monotone" dataKey="steps" stroke="#8884d8" dot={false} />
//               </LineChart>
//               <span>110 bpm</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const renderUserStats = () => {
//     return (
//       <div className="user-stats">
//         <div className="stat">
//           <span className="stat-value">75</span>
//           <span className="stat-label">Weight</span>
//         </div>
//         <div className="stat">
//           <span className="stat-value">6.5</span>
//           <span className="stat-label">Height</span>
//         </div>
//         <div className="stat">
//           <span className="stat-value">25</span>
//           <span className="stat-label">Age</span>
//         </div>
//       </div>
//     );
//   };

//   const renderGoals = () => {
//     return (
//       <div className="goals-section">
//         <h3>Your Goals</h3>
//         <div className="goals-list">
//           {goalProgressData.map((goal, index) => (
//             <div key={index} className="goal-item">
//               <div className="goal-icon">
//                 {index === 0 ? '🏃‍♂️' : index === 1 ? '😴' : '⚖️'}
//               </div>
//               <div className="goal-content">
//                 <span className="goal-name">{goal.name}</span>
//                 <span className="goal-subtitle">Daily Activity</span>
//               </div>
//               <div className="goal-progress">
//                 <div className="progress-circle">
//                   <span>{goal.value}%</span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   };

//   const renderMonthlyProgress = () => {
//     return (
//       <div className="monthly-progress">
//         <h3>Monthly Progress</h3>
//         <div className="progress-circle-container">
//           <div className="big-progress-circle">
//             <span className="progress-percentage">80%</span>
//           </div>
//           <div className="progress-text">
//             You have achieved 80% of your goal this month.
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const renderScheduled = () => {
//     return (
//       <div className="scheduled-section">
//         <h3>Scheduled</h3>
//         <div className="scheduled-list">
//           <div className="schedule-item">
//             <div className="schedule-icon">🧘‍♂️</div>
//             <div className="schedule-content">
//               <div className="schedule-title">Training - Yoga Class</div>
//               <div className="schedule-subtitle">Fitness</div>
//             </div>
//             <div className="schedule-time">20 Min</div>
//           </div>
//           <div className="schedule-item">
//             <div className="schedule-icon">🏊‍♂️</div>
//             <div className="schedule-content">
//               <div className="schedule-title">Training - Swimming</div>
//               <div className="schedule-subtitle">Fitness</div>
//             </div>
//             <div className="schedule-time">20 Min</div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const renderActivityChart = () => {
//     return (
//       <div className="activity-section">
//         <div className="section-header">
//           <h3>Activity</h3>
//           <div className="period-selector">
//             <span>Weekly</span>
//             <span className="dropdown-icon">▼</span>
//           </div>
//         </div>
//         <ResponsiveContainer width="100%" height={200}>
//           <BarChart data={weeklyActivityData}>
//             <CartesianGrid strokeDasharray="3 3" vertical={false} />
//             <XAxis dataKey="day" axisLine={false} tickLine={false} />
//             <YAxis hide={true} />
//             <Tooltip />
//             <Bar dataKey="minutes" fill="#FF8042" radius={[5, 5, 0, 0]} />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     );
//   };

//   const renderProgressDonut = () => {
//     return (
//       <div className="progress-section">
//         <div className="section-header">
//           <h3>Progress</h3>
//           <div className="period-selector">
//             <span>Weekly</span>
//             <span className="dropdown-icon">▼</span>
//           </div>
//         </div>
//         <div className="donut-container">
//           <ResponsiveContainer width="100%" height={200}>
//             <PieChart>
//               <Pie
//                 data={workoutTypeData}
//                 cx="50%"
//                 cy="50%"
//                 innerRadius={60}
//                 outerRadius={80}
//                 paddingAngle={5}
//                 dataKey="value"
//               >
//                 {workoutTypeData.map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                 ))}
//               </Pie>
//               <Tooltip />
//             </PieChart>
//           </ResponsiveContainer>
//           <div className="donut-center">
//             <span>40</span>
//             <span>hrs</span>
//           </div>
//           <div className="workout-types">
//             {workoutTypeData.map((type, index) => (
//               <div key={index} className="workout-type">
//                 <span className="type-dot" style={{ backgroundColor: COLORS[index] }}></span>
//                 <span className="type-name">{type.name}</span>
//                 <span className="type-value">{type.value} hrs</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const renderDietMenu = () => {
//     return (
//       <div className="diet-section">
//         <h3>Featured Diet Menu</h3>
//         <div className="meal-time">Breakfast <span className="meal-time-hour">12:00 am</span></div>
//         <div className="meal-items">
//           <div className="meal-item">
//             <div className="meal-image">
//               <img src="/assets/avocado.jpg" alt="Avocado Salad" />
//             </div>
//             <div className="meal-content">
//               <div className="meal-name">Avocado salad</div>
//               <div className="meal-nutrition">
//                 <div className="nutrition-bar protein"></div>
//                 <div className="nutrition-bar carbs"></div>
//                 <div className="nutrition-bar fat"></div>
//               </div>
//             </div>
//           </div>
//           <div className="meal-item">
//             <div className="meal-image">
//               <img src="/assets/blueberry.jpg" alt="Blueberry" />
//             </div>
//             <div className="meal-content">
//               <div className="meal-name">Blueberry</div>
//               <div className="meal-nutrition">
//                 <div className="nutrition-bar protein"></div>
//                 <div className="nutrition-bar carbs"></div>
//                 <div className="nutrition-bar fat"></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const renderTrainers = () => {
//     return (
//       <div className="trainers-section">
//         <h3>Recommended Trainer for you</h3>
//         <div className="trainers-container">
//           <div className="trainer-card">
//             <div className="trainer-image">
//               <img src="/assets/trainer1.jpg" alt="Trainer" />
//             </div>
//             <div className="trainer-details">
//               <h4>Cameron Williamson</h4>
//               <div className="trainer-specialty">Fitness Specialist</div>
//               <div className="trainer-rating">⭐⭐⭐⭐⭐</div>
//               <div className="trainer-stats">
//                 <span>25</span>
//                 <span>104</span>
//               </div>
//               <button className="view-profile">View Profile</button>
//             </div>
//           </div>
//           <div className="trainer-card">
//             <div className="trainer-image">
//               <img src="/assets/trainer2.jpg" alt="Trainer" />
//             </div>
//             <div className="trainer-details">
//               <h4>Cameron Williamson</h4>
//               <div className="trainer-specialty">Fitness Specialist</div>
//               <div className="trainer-rating">⭐⭐⭐⭐⭐</div>
//               <div className="trainer-stats">
//                 <span>25</span>
//                 <span>104</span>
//               </div>
//               <button className="view-profile">View Profile</button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="app-container">
//       {/* <Nav /> */}
//       <div className="dashboard-container">
//         <div className="dashboard-header">
//           <div className="greeting-section">
//             <h1>Good Morning</h1>
//             <h2>Welcome Back ⭐</h2>
//           </div>
//           <div className="header-actions">
//             <button className="subscribe-btn">Subscribe</button>
//             <div className="notification-icon">🔔</div>
//             <div className="help-icon">❓</div>
//           </div>
//           <div className="user-profile">
//             <img src="/assets/profile.jpg" alt="User Profile" className="profile-image" />
//             <div className="user-info">
//               <h3>Thomas Fletcher</h3>
//               <div className="user-status">⭐ Premium Member</div>
//             </div>
//           </div>
//         </div>

//         <div className="dashboard-content">
//           <div className="main-content">
//             <div className="left-sidebar">
//               <div className="menu-item active">🏠</div>
//               <div className="menu-item">📊</div>
//               <div className="menu-item">📆</div>
//               <div className="menu-item">📝</div>
//               <div className="menu-item">🔍</div>
//               <div className="menu-item">⚙️</div>
//               <div className="menu-item">📁</div>
//             </div>

//             <div className="center-content">
//               {renderTopMetrics()}

//               <div className="dashboard-grid">
//                 <div className="grid-item activity">
//                   {renderActivityChart()}
//                 </div>
//                 <div className="grid-item progress">
//                   {renderProgressDonut()}
//                 </div>
//                 <div className="grid-item trainers">
//                   {renderTrainers()}
//                 </div>
//                 <div className="grid-item diet">
//                   {renderDietMenu()}
//                 </div>
//               </div>
//             </div>

//             <div className="right-sidebar">
//               {renderUserStats()}
//               {renderGoals()}
//               {renderMonthlyProgress()}
//               {renderScheduled()}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FitnessDashboard;

// // import React, { useState, useEffect, useRef } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import { getAuth, onAuthStateChanged } from 'firebase/auth';
// // import Nav from './Nav'; // Import the Nav component
// // import '../styles/dashboard.css';

// // const Dashboard = () => {
// //   const [isLoggedIn, setIsLoggedIn] = useState(false);
// //   const [selectedPlan, setSelectedPlan] = useState(null);
// //   const [paymentComplete, setPaymentComplete] = useState(false);
// //   const [purchasedPlans, setPurchasedPlans] = useState([]);

// //   // Dummy payment data
// //   const [paymentData, setPaymentData] = useState({
// //     cardName: "John Doe",
// //     cardNumber: "4111 1111 1111 1111",
// //     expDate: "12/25",
// //     cvv: "123"
// //   });

// //   const paymentSectionRef = useRef(null);
// //   const navigate = useNavigate();

// //   useEffect(() => {
// //     const auth = getAuth();
// //     const unsubscribe = onAuthStateChanged(auth, (user) => {
// //       if (user && user.emailVerified) {
// //         setIsLoggedIn(true);
// //       } else {
// //         setIsLoggedIn(false);
// //         navigate('/login');
// //       }
// //     });

// //     return () => unsubscribe();
// //   }, [navigate]);

// //   const handlePayment = (plan) => {
// //     setSelectedPlan(plan);

// //     // Scroll to payment section
// //     if (paymentSectionRef.current) {
// //       paymentSectionRef.current.scrollIntoView({
// //         behavior: 'smooth',
// //         block: 'start'
// //       });
// //     }
// //   };

// //   const handleInputChange = (e) => {
// //     const { id, value } = e.target;
// //     setPaymentData(prevData => ({
// //       ...prevData,
// //       [id]: value
// //     }));
// //   };

// //   const processPayment = (e) => {
// //     e.preventDefault();
// //     // Simulate payment processing
// //     setTimeout(() => {
// //       setPaymentComplete(true);
// //       setPurchasedPlans([...purchasedPlans, selectedPlan]);

// //       // Reset payment form after 3 seconds
// //       setTimeout(() => {
// //         setPaymentComplete(false);
// //         setSelectedPlan(null);
// //       }, 3000);
// //     }, 1500);
// //   };

// //   const isPlanPurchased = (plan) => {
// //     return purchasedPlans.includes(plan);
// //   };

// //   return (
// //     <div className="dashboard-container">
// //       {/* Nav Component */}
// //       <Nav />

// //       {/* Main Content */}
// //       <div className="main-content">
// //         {/* Header */}
// //         <header className="dashboard-header">
// //           <div className="dashboard-title">
// //             <h1>Dashboard</h1>
// //           </div>
// //           <div className="user-profile">
// //             <div className="user-avatar"></div>
// //             <div className="cart-icon">🛒</div>
// //             <div className="menu-icon">⋮</div>
// //           </div>
// //         </header>

// //         {/* Greeting Section */}
// //         <div className="greeting-section">
// //           <h2>Greetings</h2>
// //           <p>Wrap up your day by checking how far you've come—your dashboard awaits.</p>
// //         </div>

// //         {/* Activity Section */}
// //         <div className="activity-section">
// //           <div className="section-header">
// //             <h2>Activity</h2>
// //             <div className="dropdown">
// //               <span>Monthly</span>
// //               <span className="dropdown-arrow">▼</span>
// //             </div>
// //           </div>

// //           <div className="activity-content">
// //             {/* Progress Circle */}
// //             <div className="progress-card">
// //               <div className="progress-header">
// //                 <h3>Progress</h3>
// //                 <div className="dropdown">
// //                   <span>Weekly</span>
// //                   <span className="dropdown-arrow">▼</span>
// //                 </div>
// //               </div>

// //               <div className="progress-circle-container">
// //                 <div className="progress-circle">
// //                   <div className="inner-circle">
// //                     <span className="value">40hrs</span>
// //                     <span className="label">Stretching</span>
// //                   </div>
// //                 </div>
// //               </div>

// //               <div className="exercise-list">
// //                 <div className="exercise-item">
// //                   <span className="exercise-dot cardio"></span>
// //                   <span className="exercise-name">Cardio</span>
// //                   <span className="exercise-value">30 hrs</span>
// //                 </div>
// //                 <div className="exercise-item">
// //                   <span className="exercise-dot stretching"></span>
// //                   <span className="exercise-name">Stretching</span>
// //                   <span className="exercise-value">40 hrs</span>
// //                 </div>
// //                 <div className="exercise-item">
// //                   <span className="exercise-dot treadmill"></span>
// //                   <span className="exercise-name">Treadmill</span>
// //                   <span className="exercise-value">30 hrs</span>
// //                 </div>
// //                 <div className="exercise-item">
// //                   <span className="exercise-dot strength"></span>
// //                   <span className="exercise-name">Strength</span>
// //                   <span className="exercise-value">20 hrs</span>
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Activity Graph */}
// //             <div className="activity-graph">
// //               <div className="graph-container">
// //                 <div className="bar-chart">
// //                   <div className="bar" style={{height: '30%'}}><span>30%</span></div>
// //                   <div className="bar" style={{height: '70%'}}><span>70%</span></div>
// //                   <div className="bar" style={{height: '50%'}}><span>50%</span></div>
// //                   <div className="bar" style={{height: '60%'}}><span>60%</span></div>
// //                   <div className="bar" style={{height: '8%'}}><span>8%</span></div>
// //                   <div className="bar" style={{height: '12%'}}><span>12%</span></div>
// //                   <div className="bar" style={{height: '11%'}}><span>11%</span></div>
// //                   <div className="bar" style={{height: '10%'}}><span>10%</span></div>
// //                 </div>
// //                 <div className="month-labels">
// //                   <span>Jan</span>
// //                   <span>Feb</span>
// //                   <span>Mar</span>
// //                   <span>Apr</span>
// //                   <span>May</span>
// //                   <span>Jun</span>
// //                   <span>Jul</span>
// //                   <span>Aug</span>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Recommended Food Section */}
// //         <div className="food-section">
// //           <div className="section-header">
// //             <h2>Recommended food</h2>
// //             <div className="dropdown">
// //               <span>Monthly</span>
// //               <span className="dropdown-arrow">▼</span>
// //             </div>
// //           </div>

// //           <div className="food-content">
// //             <div className="food-day">
// //               <h4>Day one</h4>
// //               <div className="food-item">
// //                 <h3>Veggis and Hummus</h3>
// //               </div>
// //             </div>
// //             <div className="food-day">
// //               <h4>Day two</h4>
// //               <div className="food-item">
// //                 <h3>Oatmeal with fruits</h3>
// //               </div>
// //             </div>
// //             <div className="food-day">
// //               <h4>Day three</h4>
// //               <div className="food-item">
// //                 <h3>Green variety foods</h3>
// //               </div>
// //             </div>
// //             <div className="food-day">
// //               <h4>Day four</h4>
// //               <div className="food-item">
// //                 <h3>A bowl of berries</h3>
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Subscription Plans */}
// //         <div className="subscription-section">
// //           <h2>Choose Your Fitness Plan</h2>
// //           <div className="plans-container">
// //             {/* Beginner Plan */}
// //             <div className="plan-card">
// //               <div className="plan-header beginner">
// //                 <h3>Beginner</h3>
// //               </div>
// //               <div className="plan-content">
// //                 <ul>
// //                   <li>✓ Basic workout templates</li>
// //                   <li>✓ Progress tracking</li>
// //                   <li>✓ Community support</li>
// //                   <li>✗ Personalized plans</li>
// //                   <li>✗ Advanced analytics</li>
// //                 </ul>
// //                 <div className="plan-price">
// //                   <span className="price">$9.99</span>
// //                   <span className="period">/month</span>
// //                 </div>
// //                 <button
// //                   className="plan-button"
// //                   onClick={() => handlePayment('beginner')}
// //                   disabled={isPlanPurchased('beginner')}
// //                 >
// //                   {isPlanPurchased('beginner') ? 'Purchased' : 'Buy Now'}
// //                 </button>
// //               </div>
// //             </div>

// //             {/* Intermediate Plan */}
// //             <div className="plan-card featured">
// //               <div className="plan-badge">Most Popular</div>
// //               <div className="plan-header intermediate">
// //                 <h3>Intermediate</h3>
// //               </div>
// //               <div className="plan-content">
// //                 <ul>
// //                   <li>✓ All Beginner features</li>
// //                   <li>✓ Personalized workout plans</li>
// //                   <li>✓ Nutrition tracking</li>
// //                   <li>✓ Weekly progress reports</li>
// //                   <li>✗ 1-on-1 coaching</li>
// //                 </ul>
// //                 <div className="plan-price">
// //                   <span className="price">$19.99</span>
// //                   <span className="period">/month</span>
// //                 </div>
// //                 <button
// //                   className="plan-button"
// //                   onClick={() => handlePayment('intermediate')}
// //                   disabled={isPlanPurchased('intermediate')}
// //                 >
// //                   {isPlanPurchased('intermediate') ? 'Purchased' : 'Buy Now'}
// //                 </button>
// //               </div>
// //             </div>

// //             {/* Advanced Plan */}
// //             <div className="plan-card">
// //               <div className="plan-header advanced">
// //                 <h3>Advanced</h3>
// //               </div>
// //               <div className="plan-content">
// //                 <ul>
// //                   <li>✓ All Intermediate features</li>
// //                   <li>✓ Advanced performance analytics</li>
// //                   <li>✓ 1-on-1 coaching sessions</li>
// //                   <li>✓ Custom nutrition plans</li>
// //                   <li>✓ Priority support</li>
// //                 </ul>
// //                 <div className="plan-price">
// //                   <span className="price">$29.99</span>
// //                   <span className="period">/month</span>
// //                 </div>
// //                 <button
// //                   className="plan-button"
// //                   onClick={() => handlePayment('advanced')}
// //                   disabled={isPlanPurchased('advanced')}
// //                 >
// //                   {isPlanPurchased('advanced') ? 'Purchased' : 'Buy Now'}
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Payment Section */}
// //         <div
// //           ref={paymentSectionRef}
// //           className={`payment-section ${selectedPlan ? 'active' : ''}`}
// //           id="payment"
// //         >
// //           <h2>Complete Your Payment</h2>
// //           {selectedPlan && !paymentComplete ? (
// //             <div className="payment-container">
// //               <div className="order-summary">
// //                 <h3>Order Summary</h3>
// //                 <div className="order-details">
// //                   <div className="order-item">
// //                     <span>{selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan</span>
// //                     <span className="order-price">
// //                       ${selectedPlan === 'beginner' ? '9.99' : selectedPlan === 'intermediate' ? '19.99' : '29.99'}
// //                     </span>
// //                   </div>
// //                   <div className="order-total">
// //                     <span>Total</span>
// //                     <span className="order-price">
// //                       ${selectedPlan === 'beginner' ? '9.99' : selectedPlan === 'intermediate' ? '19.99' : '29.99'}
// //                     </span>
// //                   </div>
// //                 </div>
// //               </div>

// //               <form className="payment-form" onSubmit={processPayment}>
// //                 <div className="form-group">
// //                   <label htmlFor="cardName">Name on Card</label>
// //                   <input
// //                     type="text"
// //                     id="cardName"
// //                     value={paymentData.cardName}
// //                     onChange={handleInputChange}
// //                     required
// //                   />
// //                 </div>

// //                 <div className="form-group">
// //                   <label htmlFor="cardNumber">Card Number</label>
// //                   <input
// //                     type="text"
// //                     id="cardNumber"
// //                     value={paymentData.cardNumber}
// //                     onChange={handleInputChange}
// //                     required
// //                   />
// //                 </div>

// //                 <div className="form-row">
// //                   <div className="form-group">
// //                     <label htmlFor="expDate">Expiration Date</label>
// //                     <input
// //                       type="text"
// //                       id="expDate"
// //                       value={paymentData.expDate}
// //                       onChange={handleInputChange}
// //                       required
// //                     />
// //                   </div>

// //                   <div className="form-group">
// //                     <label htmlFor="cvv">CVV</label>
// //                     <input
// //                       type="text"
// //                       id="cvv"
// //                       value={paymentData.cvv}
// //                       onChange={handleInputChange}
// //                       required
// //                     />
// //                   </div>
// //                 </div>

// //                 <button type="submit" className="payment-button">
// //                   Complete Payment
// //                 </button>
// //               </form>
// //             </div>
// //           ) : paymentComplete ? (
// //             <div className="payment-success">
// //               <div className="success-icon">✓</div>
// //               <h3>Payment Successful!</h3>
// //               <p>Thank you for purchasing the {selectedPlan} plan!</p>
// //               <p>Your subscription is now active.</p>
// //             </div>
// //           ) : (
// //             <p className="select-plan-message">Select a plan above to proceed with payment</p>
// //           )}
// //         </div>

// //         {/* Footer */}
// //         <footer className="dashboard-footer">
// //           <p>&copy; 2025 Fitness Tracker. All rights reserved.</p>
// //         </footer>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Dashboard;

// // // import React, { useState, useEffect } from 'react';
// // // import { useNavigate } from 'react-router-dom';
// // // import { getAuth, onAuthStateChanged } from 'firebase/auth';
// // // import Nav from './Nav'; // Import the Nav component
// // // import '../styles/dashboard.css';

// // // const Dashboard = () => {
// // //   const [isLoggedIn, setIsLoggedIn] = useState(false);
// // //   const navigate = useNavigate();

// // //   useEffect(() => {
// // //     const auth = getAuth();
// // //     const unsubscribe = onAuthStateChanged(auth, (user) => {
// // //       if (user && user.emailVerified) {
// // //         setIsLoggedIn(true);
// // //       } else {
// // //         setIsLoggedIn(false);
// // //         navigate('/login');
// // //       }
// // //     });

// // //     return () => unsubscribe();
// // //   }, [navigate]);

// // //   const handlePayment = (plan) => {
// // //     // Navigate to payment page with selected plan
// // //     navigate('/payment', { state: { selectedPlan: plan } });
// // //   };

// // //   return (
// // //     <div className="dashboard-container">
// // //       {/* Nav Component */}
// // //       <Nav />

// // //       {/* Main Content */}
// // //       <div className="main-content">
// // //         {/* Header */}
// // //         <header className="dashboard-header">
// // //           <div className="dashboard-title">
// // //             <h1>Dashboard</h1>
// // //           </div>
// // //           <div className="user-profile">
// // //             <div className="user-avatar"></div>
// // //             <div className="cart-icon">🛒</div>
// // //             <div className="menu-icon">⋮</div>
// // //           </div>
// // //         </header>

// // //         {/* Greeting Section */}
// // //         <div className="greeting-section">
// // //           <h2>Greetings</h2>
// // //           <p>Wrap up your day by checking how far you've come—your dashboard awaits.</p>
// // //         </div>

// // //         {/* Activity Section */}
// // //         <div className="activity-section">
// // //           <div className="section-header">
// // //             <h2>Activity</h2>
// // //             <div className="dropdown">
// // //               <span>Monthly</span>
// // //               <span className="dropdown-arrow">▼</span>
// // //             </div>
// // //           </div>

// // //           <div className="activity-content">
// // //             {/* Progress Circle */}
// // //             <div className="progress-card">
// // //               <div className="progress-header">
// // //                 <h3>Progress</h3>
// // //                 <div className="dropdown">
// // //                   <span>Weekly</span>
// // //                   <span className="dropdown-arrow">▼</span>
// // //                 </div>
// // //               </div>

// // //               <div className="progress-circle-container">
// // //                 <div className="progress-circle">
// // //                   <div className="inner-circle">
// // //                     <span className="value">40hrs</span>
// // //                     <span className="label">Stretching</span>
// // //                   </div>
// // //                 </div>
// // //               </div>

// // //               <div className="exercise-list">
// // //                 <div className="exercise-item">
// // //                   <span className="exercise-dot cardio"></span>
// // //                   <span className="exercise-name">Cardio</span>
// // //                   <span className="exercise-value">30 hrs</span>
// // //                 </div>
// // //                 <div className="exercise-item">
// // //                   <span className="exercise-dot stretching"></span>
// // //                   <span className="exercise-name">Stretching</span>
// // //                   <span className="exercise-value">40 hrs</span>
// // //                 </div>
// // //                 <div className="exercise-item">
// // //                   <span className="exercise-dot treadmill"></span>
// // //                   <span className="exercise-name">Treadmill</span>
// // //                   <span className="exercise-value">30 hrs</span>
// // //                 </div>
// // //                 <div className="exercise-item">
// // //                   <span className="exercise-dot strength"></span>
// // //                   <span className="exercise-name">Strength</span>
// // //                   <span className="exercise-value">20 hrs</span>
// // //                 </div>
// // //               </div>
// // //             </div>

// // //             {/* Activity Graph */}
// // //             <div className="activity-graph">
// // //               <div className="graph-container">
// // //                 <div className="bar-chart">
// // //                   <div className="bar" style={{height: '30%'}}><span>30%</span></div>
// // //                   <div className="bar" style={{height: '70%'}}><span>70%</span></div>
// // //                   <div className="bar" style={{height: '50%'}}><span>50%</span></div>
// // //                   <div className="bar" style={{height: '60%'}}><span>60%</span></div>
// // //                   <div className="bar" style={{height: '8%'}}><span>8%</span></div>
// // //                   <div className="bar" style={{height: '12%'}}><span>12%</span></div>
// // //                   <div className="bar" style={{height: '11%'}}><span>11%</span></div>
// // //                   <div className="bar" style={{height: '10%'}}><span>10%</span></div>
// // //                 </div>
// // //                 <div className="month-labels">
// // //                   <span>Jan</span>
// // //                   <span>Feb</span>
// // //                   <span>Mar</span>
// // //                   <span>Apr</span>
// // //                   <span>May</span>
// // //                   <span>Jun</span>
// // //                   <span>Jul</span>
// // //                   <span>Aug</span>
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </div>

// // //         {/* Recommended Food Section */}
// // //         <div className="food-section">
// // //           <div className="section-header">
// // //             <h2>Recommended food</h2>
// // //             <div className="dropdown">
// // //               <span>Monthly</span>
// // //               <span className="dropdown-arrow">▼</span>
// // //             </div>
// // //           </div>

// // //           <div className="food-content">
// // //             <div className="food-day">
// // //               <h4>Day one</h4>
// // //               <div className="food-item">
// // //                 <h3>Veggis and Hummus</h3>
// // //               </div>
// // //             </div>
// // //             <div className="food-day">
// // //               <h4>Day two</h4>
// // //               <div className="food-item">
// // //                 <h3>Oatmeal with fruits</h3>
// // //               </div>
// // //             </div>
// // //             <div className="food-day">
// // //               <h4>Day three</h4>
// // //               <div className="food-item">
// // //                 <h3>Green variety foods</h3>
// // //               </div>
// // //             </div>
// // //             <div className="food-day">
// // //               <h4>Day four</h4>
// // //               <div className="food-item">
// // //                 <h3>A bowl of berries</h3>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </div>

// // //         {/* Subscription Plans */}
// // //         <div className="subscription-section">
// // //           <h2>Choose Your Fitness Plan</h2>
// // //           <div className="plans-container">
// // //             {/* Beginner Plan */}
// // //             <div className="plan-card">
// // //               <div className="plan-header beginner">
// // //                 <h3>Beginner</h3>
// // //               </div>
// // //               <div className="plan-content">
// // //                 <ul>
// // //                   <li>✓ Basic workout templates</li>
// // //                   <li>✓ Progress tracking</li>
// // //                   <li>✓ Community support</li>
// // //                   <li>✗ Personalized plans</li>
// // //                   <li>✗ Advanced analytics</li>
// // //                 </ul>
// // //                 <div className="plan-price">
// // //                   <span className="price">$9.99</span>
// // //                   <span className="period">/month</span>
// // //                 </div>
// // //                 <button
// // //                   className="plan-button"
// // //                   onClick={() => handlePayment('beginner')}
// // //                 >
// // //                   Buy Now
// // //                 </button>
// // //               </div>
// // //             </div>

// // //             {/* Intermediate Plan */}
// // //             <div className="plan-card featured">
// // //               <div className="plan-badge">Most Popular</div>
// // //               <div className="plan-header intermediate">
// // //                 <h3>Intermediate</h3>
// // //               </div>
// // //               <div className="plan-content">
// // //                 <ul>
// // //                   <li>✓ All Beginner features</li>
// // //                   <li>✓ Personalized workout plans</li>
// // //                   <li>✓ Nutrition tracking</li>
// // //                   <li>✓ Weekly progress reports</li>
// // //                   <li>✗ 1-on-1 coaching</li>
// // //                 </ul>
// // //                 <div className="plan-price">
// // //                   <span className="price">$19.99</span>
// // //                   <span className="period">/month</span>
// // //                 </div>
// // //                 <button
// // //                   className="plan-button"
// // //                   onClick={() => handlePayment('intermediate')}
// // //                 >
// // //                   Buy Now
// // //                 </button>
// // //               </div>
// // //             </div>

// // //             {/* Advanced Plan */}
// // //             <div className="plan-card">
// // //               <div className="plan-header advanced">
// // //                 <h3>Advanced</h3>
// // //               </div>
// // //               <div className="plan-content">
// // //                 <ul>
// // //                   <li>✓ All Intermediate features</li>
// // //                   <li>✓ Advanced performance analytics</li>
// // //                   <li>✓ 1-on-1 coaching sessions</li>
// // //                   <li>✓ Custom nutrition plans</li>
// // //                   <li>✓ Priority support</li>
// // //                 </ul>
// // //                 <div className="plan-price">
// // //                   <span className="price">$29.99</span>
// // //                   <span className="period">/month</span>
// // //                 </div>
// // //                 <button
// // //                   className="plan-button"
// // //                   onClick={() => handlePayment('advanced')}
// // //                 >
// // //                   Buy Now
// // //                 </button>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </div>

// // //         {/* Footer */}
// // //         <footer className="dashboard-footer">
// // //           <p>&copy; 2025 Fitness Tracker. All rights reserved.</p>
// // //         </footer>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default Dashboard;
