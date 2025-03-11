/* Last Name, First Name - Student ID */
/* 
 Suresh, Kaushick ( 1002237680 ), 
 Sivaprakash, Akshay Prassanna ( 1002198274 ) ,  
 Sonwane, Pratik ( 1002170610 ) , 
 Shaik, Arfan ( 1002260039 ) , 
 Sheth, Jeet ( 1002175315 ) 
*/
import React, { useState, useEffect } from 'react';
import '../styles/progressdashboard.css';
import Nav from '../components/Nav';
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
  ResponsiveContainer 
} from 'recharts';

const mockProgressData = [
  { month: 'Jan', weight: 180, steps: 5000, calories: 2200, workoutDuration: 45 },
  { month: 'Feb', weight: 175, steps: 6000, calories: 2100, workoutDuration: 60 },
  { month: 'Mar', weight: 170, steps: 7000, calories: 2000, workoutDuration: 75 },
  { month: 'Apr', weight: 168, steps: 8000, calories: 1900, workoutDuration: 90 },
];

const ProgressDashboard = () => {
  const [selectedMetrics, setSelectedMetrics] = useState({
    weight: true,
    steps: true,
    calories: false,
    workoutDuration: false
  });

  const [chartType, setChartType] = useState('line');
  const [purchasedPlans, setPurchasedPlans] = useState(() => {
    const savedPlans = localStorage.getItem('purchasedPlans');
    return savedPlans ? JSON.parse(savedPlans) : [];
  });
  useEffect(() => {
    localStorage.setItem('purchasedPlans', JSON.stringify(purchasedPlans));
  }, [purchasedPlans]);
  const toggleMetric = (metric) => {
    setSelectedMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  const getVisibleMetrics = () => {
    return Object.keys(selectedMetrics)
      .filter(metric => selectedMetrics[metric]);
  };

  const renderAIInsights = () => {
    const insights = [
      "You're consistently improving your daily steps.",
      "Consider increasing workout duration for better results.",
      "Steady weight loss trend observed."
    ];

    return (
      <div className="ai-insights">
        <h3>AI-Driven Insights</h3>
        <ul>
          {insights.map((insight, index) => (
            <li key={index}>{insight}</li>
          ))}
        </ul>
      </div>
    );
  };

  const renderChart = () => {
    const visibleMetrics = getVisibleMetrics();
    
    const ChartComponent = chartType === 'bar' ? BarChart : LineChart;
    const BarOrLineComponent = chartType === 'bar' ? Bar : Line;

    return (
      <ResponsiveContainer width="90%" height={300}>
        <ChartComponent data={mockProgressData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          {visibleMetrics.map((metric, index) => (
            <BarOrLineComponent 
              key={metric}
              type="monotone"
              dataKey={metric} 
              fill={`hsl(${index * 60}, 70%, 50%)`}
              stroke={`hsl(${index * 60}, 70%, 50%)`}
              name={metric.charAt(0).toUpperCase() + metric.slice(1)}
            />
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="app-container">
      <Nav purchasedPlans={purchasedPlans} />
      <div className="progress-dashboard-container">
        <h1 className="dashboard-title">Fitness Progress Dashboard</h1>
        
        <div className="dashboard-content">
          <div className="insights-section">
            {renderAIInsights()}
          </div>
          
          <div className="main-content2">
            <div className="chart-section" style={{ textAlign: 'right' }}>
              <div className="chart-header">
                <h2>Progress Metrics</h2>
                <div className="chart-controls">
                  <label>
                    Chart Type:
                    <select 
                      value={chartType}
                      onChange={(e) => setChartType(e.target.value)}
                    >
                      <option value="line">Line Chart</option>
                      <option value="bar">Bar Chart</option>
                    </select>
                  </label>
                </div>
              </div>
              <div className="chart-container">
                {renderChart()}
              </div>
            </div>

            <div className="metrics-selector">
              <h2>Customize Metrics</h2>
              <div className="metrics-grid">
                {Object.keys(selectedMetrics).map((metric) => (
                  <label 
                    key={metric} 
                    className="metric-checkbox"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMetrics[metric]}
                      onChange={() => toggleMetric(metric)}
                    />
                    <span>{metric.charAt(0).toUpperCase() + metric.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;