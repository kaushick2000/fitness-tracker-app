import React, { useState, useEffect } from 'react';
import '../styles/nutrition.css';
import food from "../data/food_data.json";
import Nav from '../components/Nav';
const NutritionPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [foodDetails, setFoodDetails] = useState({});
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);

  // Fetch food details from the JSON file
  useEffect(() => {
    const fetchFoodDetails = async () => {
      try {
;
        setFoodDetails(food);
        setFilteredFoods(Object.keys(food));
      } catch (error) {
        console.error('Error fetching food details:', error);
      }
    };

    fetchFoodDetails();
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredFoods(Object.keys(foodDetails));
    } else {
      const filtered = Object.keys(foodDetails).filter(food => 
        food.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredFoods(filtered);
    }
  };

  // Handle food selection
  const handleFoodSelect = (food) => {
    setSelectedFood(food);
  };

  // Format nutrition values
  const formatValue = (value) => {
    return typeof value === 'number' ? value.toFixed(1) : value;
  };

  return (
    
    <div className="nutrition-container">
        <Nav/>
      <h1 className="nutrition-heading">Nutrition Information</h1>
      
      <div className="search-section">
        <input
          type="text"
          placeholder="Search foods..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        
        {searchTerm && (
          <div className="search-results">
            {filteredFoods.length > 0 ? (
              filteredFoods.map((food, index) => (
                <div 
                  key={index} 
                  className="food-item" 
                  onClick={() => handleFoodSelect(food)}
                >
                  {food}
                </div>
              ))
            ) : (
              <div className="no-results">No foods found</div>
            )}
          </div>
        )}
      </div>

      {selectedFood && (
        <div className="food-details">
          <h2 className="food-name">{selectedFood}</h2>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Category:</span>
              <span className="detail-value">{foodDetails[selectedFood].Category}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Meal Type:</span>
              <span className="detail-value">{foodDetails[selectedFood].Meal_Type}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Calories:</span>
              <span className="detail-value">{formatValue(foodDetails[selectedFood]["Calories (kcal)"])} kcal</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Protein:</span>
              <span className="detail-value">{formatValue(foodDetails[selectedFood]["Protein (g)"])} g</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Carbs:</span>
              <span className="detail-value">{formatValue(foodDetails[selectedFood]["Carbohydrates (g)"])} g</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Fat:</span>
              <span className="detail-value">{formatValue(foodDetails[selectedFood]["Fat (g)"])} g</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Fiber:</span>
              <span className="detail-value">{formatValue(foodDetails[selectedFood]["Fiber (g)"])} g</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Sugars:</span>
              <span className="detail-value">{formatValue(foodDetails[selectedFood]["Sugars (g)"])} g</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Sodium:</span>
              <span className="detail-value">{formatValue(foodDetails[selectedFood]["Sodium (mg)"])} mg</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Cholesterol:</span>
              <span className="detail-value">{formatValue(foodDetails[selectedFood]["Cholesterol (mg)"])} mg</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Water Intake:</span>
              <span className="detail-value">{formatValue(foodDetails[selectedFood]["Water_Intake (ml)"])} ml</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionPage;