import React, { useState, useEffect } from 'react';
import '../styles/nutrition.css';
import food from "../data/food_data.json";
import Nav from '../components/Nav';

const NutritionPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [foodDetails, setFoodDetails] = useState({});
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [cart, setCart] = useState([]);
  const [mealType, setMealType] = useState('Breakfast');
  const [savedMeals, setSavedMeals] = useState([]);
  const [quantity, setQuantity] = useState(1);

  // Fetch food details from the JSON file
  useEffect(() => {
    try {
      setFoodDetails(food);
      setFilteredFoods(Object.keys(food));
    } catch (error) {
      console.error('Error fetching food details:', error);
    }
  }, []);

  // Load saved meals from localStorage on component mount
  useEffect(() => {
    const savedMealsFromStorage = localStorage.getItem('savedMeals');
    if (savedMealsFromStorage) {
      setSavedMeals(JSON.parse(savedMealsFromStorage));
    }
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
    setQuantity(1);
  };

  // Format nutrition values
  const formatValue = (value) => {
    return typeof value === 'number' ? value.toFixed(1) : value;
  };

  // Add selected food to cart
  const addToCart = () => {
    if (selectedFood) {
      const newItem = {
        name: selectedFood,
        quantity: quantity,
        details: foodDetails[selectedFood],
        calories: foodDetails[selectedFood]["Calories (kcal)"] * quantity,
        protein: foodDetails[selectedFood]["Protein (g)"] * quantity,
        carbs: foodDetails[selectedFood]["Carbohydrates (g)"] * quantity,
        fat: foodDetails[selectedFood]["Fat (g)"] * quantity
      };
      
      setCart([...cart, newItem]);
      setSelectedFood(null);
      setSearchTerm('');
    }
  };

  // Remove item from cart
  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  // Calculate total calories and nutrients
  const calculateTotals = () => {
    return cart.reduce((totals, item) => {
      return {
        calories: totals.calories + item.calories,
        protein: totals.protein + item.protein,
        carbs: totals.carbs + item.carbs,
        fat: totals.fat + item.fat
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  // Save current meal
  const saveMeal = () => {
    if (cart.length > 0) {
      const totals = calculateTotals();
      const newMeal = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        type: mealType,
        items: [...cart],
        totals
      };
      
      const updatedMeals = [...savedMeals, newMeal];
      setSavedMeals(updatedMeals);
      localStorage.setItem('savedMeals', JSON.stringify(updatedMeals));
      
      // Clear cart after saving
      setCart([]);
      alert(`${mealType} saved successfully!`);
    } else {
      alert('Add food items to save a meal');
    }
  };

  // Delete a saved meal
  const deleteSavedMeal = (id) => {
    const updatedMeals = savedMeals.filter(meal => meal.id !== id);
    setSavedMeals(updatedMeals);
    localStorage.setItem('savedMeals', JSON.stringify(updatedMeals));
  };

  const totals = calculateTotals();

  return (
    <div className="nutrition-container">
      <Nav/>
      <h1 className="nutrition-heading">Nutrition Tracker</h1>
      
      <div className="nutrition-layout">
        <div className="search-section">
          <h2>Add Food Items</h2>
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

          {selectedFood && (
            <div className="food-details">
              <h3 className="food-name">{selectedFood}</h3>
              <div className="details-grid">
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
              </div>
              
              <div className="quantity-selector">
                <label htmlFor="quantity">Quantity:</label>
                <input 
                  type="number" 
                  id="quantity" 
                  min="1" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
              
              <button className="add-to-cart-btn" onClick={addToCart}>
                Add to Meal
              </button>
            </div>
          )}
        </div>

        <div className="cart-section">
          <div className="meal-type-selector">
            <label htmlFor="meal-type">Meal Type:</label>
            <select 
              id="meal-type" 
              value={mealType} 
              onChange={(e) => setMealType(e.target.value)}
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack</option>
            </select>
          </div>
          
          <h2>Current Meal: {mealType}</h2>
          
          {cart.length > 0 ? (
            <>
              <div className="cart-items">
                {cart.map((item, index) => (
                  <div key={index} className="cart-item">
                    <div className="cart-item-info">
                      <span className="cart-item-name">{item.name} (x{item.quantity})</span>
                      <span className="cart-item-calories">{formatValue(item.calories)} kcal</span>
                    </div>
                    <button 
                      className="remove-item-btn" 
                      onClick={() => removeFromCart(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="cart-totals">
                <h3>Meal Totals</h3>
                <div className="totals-grid">
                  <div className="total-item">
                    <span className="total-label">Calories:</span>
                    <span className="total-value">{formatValue(totals.calories)} kcal</span>
                  </div>
                  <div className="total-item">
                    <span className="total-label">Protein:</span>
                    <span className="total-value">{formatValue(totals.protein)} g</span>
                  </div>
                  <div className="total-item">
                    <span className="total-label">Carbs:</span>
                    <span className="total-value">{formatValue(totals.carbs)} g</span>
                  </div>
                  <div className="total-item">
                    <span className="total-label">Fat:</span>
                    <span className="total-value">{formatValue(totals.fat)} g</span>
                  </div>
                </div>
                
                <button 
                  className="save-meal-btn" 
                  onClick={saveMeal}
                >
                  Save {mealType}
                </button>
              </div>
            </>
          ) : (
            <div className="empty-cart">
              <p>Your meal is empty. Add food items to track your nutrition.</p>
            </div>
          )}
        </div>
      </div>

      <div className="saved-meals-section">
        <h2>Saved Meals</h2>
        {savedMeals.length > 0 ? (
          <div className="saved-meals-list">
            {savedMeals.map((meal) => (
              <div key={meal.id} className="saved-meal-card">
                <div className="saved-meal-header">
                  <h3>{meal.type} - {meal.date}</h3>
                  <button 
                    className="delete-meal-btn"
                    onClick={() => deleteSavedMeal(meal.id)}
                  >
                    Delete
                  </button>
                </div>
                <div className="saved-meal-totals">
                  <span>Calories: {formatValue(meal.totals.calories)} kcal</span>
                  <span>Protein: {formatValue(meal.totals.protein)} g</span>
                  <span>Carbs: {formatValue(meal.totals.carbs)} g</span>
                  <span>Fat: {formatValue(meal.totals.fat)} g</span>
                </div>
                <div className="saved-meal-items">
                  {meal.items.map((item, index) => (
                    <div key={index} className="saved-meal-item">
                      {item.name} (x{item.quantity}) - {formatValue(item.calories)} kcal
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-saved-meals">
            <p>No saved meals yet. Add and save meals to track your nutrition over time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionPage;