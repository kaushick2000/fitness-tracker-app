import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../styles/nutritionvisualization.css'
const NutritionVisualization = () => {
  const [savedMeals, setSavedMeals] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [macroData, setMacroData] = useState([]);
  const [selectedView, setSelectedView] = useState('daily');

  useEffect(() => {
    // Load saved meals from localStorage
    const savedMealsFromStorage = localStorage.getItem('savedMeals');
    if (savedMealsFromStorage) {
      const meals = JSON.parse(savedMealsFromStorage);
      setSavedMeals(meals);
      
      // Process data for visualizations
      processDataForCharts(meals);
    }
  }, []);

  const processDataForCharts = (meals) => {
    // Group meals by date for daily calories chart
    const dailyCalories = meals.reduce((acc, meal) => {
      const date = meal.date;
      if (!acc[date]) {
        acc[date] = {
          date,
          calories: 0,
          breakfast: 0,
          lunch: 0,
          dinner: 0,
          snack: 0
        };
      }
      
      acc[date].calories += meal.totals.calories;
      
      // Add calories by meal type
      const mealType = meal.type.toLowerCase();
      acc[date][mealType] += meal.totals.calories;
      
      return acc;
    }, {});

    // Convert to array for chart
    const dailyDataArray = Object.values(dailyCalories).sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
    
    // Get last 7 days if more data exists
    const last7Days = dailyDataArray.slice(-7);
    setDailyData(last7Days);

    // Calculate average macronutrients
    if (meals.length > 0) {
      const totalMacros = meals.reduce((acc, meal) => {
        acc.protein += meal.totals.protein;
        acc.carbs += meal.totals.carbs;
        acc.fat += meal.totals.fat;
        return acc;
      }, { protein: 0, carbs: 0, fat: 0 });

      const avgMacros = {
        protein: totalMacros.protein / meals.length,
        carbs: totalMacros.carbs / meals.length,
        fat: totalMacros.fat / meals.length
      };

      // Format for pie chart
      const macroChartData = [
        { name: 'Protein', value: avgMacros.protein },
        { name: 'Carbs', value: avgMacros.carbs },
        { name: 'Fat', value: avgMacros.fat }
      ];
      
      setMacroData(macroChartData);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const MACRO_COLORS = ['#FF6B6B', '#4ECDC4', '#FFD166'];

  const formatValue = (value) => {
    return typeof value === 'number' ? value.toFixed(1) : value;
  };

  return (
    <div className="nutrition-visualization">
      <h2>Nutrition Insights</h2>
      
      {savedMeals.length > 0 ? (
        <>
          <div className="visualization-tabs">
            <button 
              className={`viz-tab ${selectedView === 'daily' ? 'active' : ''}`}
              onClick={() => setSelectedView('daily')}
            >
              Daily Calories
            </button>
            <button 
              className={`viz-tab ${selectedView === 'macros' ? 'active' : ''}`}
              onClick={() => setSelectedView('macros')}
            >
              Macro Breakdown
            </button>
          </div>

          <div className="visualization-container">
            {selectedView === 'daily' && dailyData.length > 0 && (
              <div className="chart-container">
                <h3>Daily Calorie Intake</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis label={{ value: 'Calories (kcal)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => [`${formatValue(value)} kcal`, '']} />
                    <Legend />
                    <Bar dataKey="breakfast" stackId="a" fill="#FFD166" name="Breakfast" />
                    <Bar dataKey="lunch" stackId="a" fill="#06D6A0" name="Lunch" />
                    <Bar dataKey="dinner" stackId="a" fill="#118AB2" name="Dinner" />
                    <Bar dataKey="snack" stackId="a" fill="#EF476F" name="Snack" />
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="chart-summary">
                  <p>
                    <strong>Average Daily Intake:</strong> {formatValue(dailyData.reduce((acc, day) => acc + day.calories, 0) / dailyData.length)} kcal
                  </p>
                </div>
              </div>
            )}

            {selectedView === 'macros' && macroData.length > 0 && (
              <div className="chart-container">
                <h3>Average Macro Nutrient Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={macroData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={MACRO_COLORS[index % MACRO_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${formatValue(value)} g`, '']} />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="macro-summary">
                  <div className="macro-stat" style={{ color: MACRO_COLORS[0] }}>
                    <strong>Protein:</strong> {formatValue(macroData[0].value)} g
                  </div>
                  <div className="macro-stat" style={{ color: MACRO_COLORS[1] }}>
                    <strong>Carbs:</strong> {formatValue(macroData[1].value)} g
                  </div>
                  <div className="macro-stat" style={{ color: MACRO_COLORS[2] }}>
                    <strong>Fat:</strong> {formatValue(macroData[2].value)} g
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="no-data-message">
          <p>No nutrition data available yet. Track your meals in the Nutrition Tracker to see insights here.</p>
        </div>
      )}
    </div>
  );
};

export default NutritionVisualization;