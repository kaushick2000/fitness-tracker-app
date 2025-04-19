/* Last Name, First Name - Student ID */
/* 
 Suresh, Kaushick ( 1002237680 ), 
 Sivaprakash, Akshay Prassanna ( 1002198274 ) ,  
 Sonwane, Pratik ( 1002170610 ) , 
 Shaik, Arfan ( 1002260039 ) , 
 Sheth, Jeet ( 1002175315 ) 
*/
import React, { useState, useEffect } from 'react';
import '../styles/nutrition.css';
import Nav from '../components/Nav';

const NutritionPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [cart, setCart] = useState([]);
  const [mealType, setMealType] = useState('Breakfast');
  const [savedMeals, setSavedMeals] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load saved meals from API on component mount
  useEffect(() => {
    fetchSavedMeals();
  }, []);

  // Fetch saved meals from the backend
  const fetchSavedMeals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3000/api/intake', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch saved meals: ${response.status}`);
      }
      
      const data = await response.json();
      setSavedMeals(data);
    } catch (error) {
      console.error('Error fetching saved meals:', error);
      setError('Failed to load saved meals. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredFoods([]);
    } else {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:3000/api/nutrition/search?term=${encodeURIComponent(term)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to search foods: ${response.status}`);
        }
        
        const data = await response.json();
        setFilteredFoods(data);
      } catch (error) {
        console.error('Error searching foods:', error);
        setError('Failed to search foods. Please try again later.');
        setFilteredFoods([]);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle food selection
  const handleFoodSelect = async (foodId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:3000/api/nutrition/${foodId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch food details: ${response.status}`);
      }
      
      const foodData = await response.json();
      setSelectedFood(foodData);
      setQuantity(1);
    } catch (error) {
      console.error('Error fetching food details:', error);
      setError('Failed to load food details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Format nutrition values
  const formatValue = (value) => {
    return typeof value === 'number' ? value.toFixed(1) : value;
  };

  // Add selected food to cart
  const addToCart = () => {
    if (selectedFood) {
      const newItem = {
        id: selectedFood.nutrition_id,
        name: selectedFood.food_item,
        quantity: quantity,
        details: selectedFood,
        calories: selectedFood.calories * quantity,
        protein: selectedFood.protein * quantity,
        carbs: selectedFood.carbs * quantity,
        fat: selectedFood.fat * quantity
      };
      
      setCart([...cart, newItem]);
      setSelectedFood(null);
      setSearchTerm('');
      setFilteredFoods([]);
    }
  };
  // In your Nutrition.js file where you're making the search request:
const fetchSearchResults = async (term) => {
  try {
    const response = await fetch(`http://localhost:3000/api/nutrition/search?term=${term}`, {
      method: 'GET',
      credentials: 'include', // This must match your CORS configuration
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching foods:', error);
    throw error;
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
        calories: totals.calories + (item.calories || 0),
        protein: totals.protein + (item.protein || 0),
        carbs: totals.carbs + (item.carbs || 0),
        fat: totals.fat + (item.fat || 0)
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  // Save current meal
  const saveMeal = async () => {
    if (cart.length > 0) {
      try {
        setLoading(true);
        setError(null);
        
        // Prepare data for API
        const mealData = {
          type_meal: mealType,
          items: cart.map(item => ({
            nutrition_id: item.id,
            quantity: item.quantity
          }))
        };
        
        const response = await fetch('http://localhost:3000/api/intake', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(mealData),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to save meal: ${response.status}`);
        }
        
        // Refresh saved meals
        await fetchSavedMeals();
        
        // Clear cart after saving
        setCart([]);
        alert(`${mealType} saved successfully!`);
      } catch (error) {
        console.error('Error saving meal:', error);
        setError('Failed to save meal. Please try again later.');
      } finally {
        setLoading(false);
      }
    } else {
      alert('Add food items to save a meal');
    }
  };

  // Delete a saved meal
  const deleteSavedMeal = async (intakeId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:3000/api/intake/${intakeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to delete meal: ${response.status}`);
      }
      
      // Refresh saved meals
      await fetchSavedMeals();
    } catch (error) {
      console.error('Error deleting meal:', error);
      setError('Failed to delete meal. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  // Group saved meals by date and meal type
  const groupedMeals = savedMeals.reduce((acc, meal) => {
    const date = new Date(meal.intake_date).toLocaleDateString();
    const key = `${date}-${meal.type_meal}`;
    
    if (!acc[key]) {
      acc[key] = {
        id: key,
        date,
        type: meal.type_meal,
        items: [],
        totals: { calories: 0, protein: 0, carbs: 0, fat: 0 }
      };
    }
    
    const calories = (meal.nutrition?.calories || 0) * meal.quantity;
    const protein = (meal.nutrition?.protein || 0) * meal.quantity;
    const carbs = (meal.nutrition?.carbs || 0) * meal.quantity;
    const fat = (meal.nutrition?.fat || 0) * meal.quantity;
    
    acc[key].items.push({
      intake_id: meal.intake_id,
      name: meal.nutrition?.food_item || 'Unknown Food',
      quantity: meal.quantity,
      calories
    });
    
    acc[key].totals.calories += calories;
    acc[key].totals.protein += protein;
    acc[key].totals.carbs += carbs;
    acc[key].totals.fat += fat;
    
    return acc;
  }, {});

  // Convert grouped meals to array
  const groupedMealsArray = Object.values(groupedMeals);

  return (
    <div className="nutrition-container">
      <Nav/>
      <h1 className="nutrition-heading">Nutrition Tracker</h1>
      
      {error && <div className="error-message">{error}</div>}
      
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
          
          {loading && searchTerm && <div className="loading">Searching foods...</div>}
          
          {searchTerm && !loading && (
            <div className="search-results">
              {filteredFoods.length > 0 ? (
                filteredFoods.map((food) => (
                  <div 
                    key={food.nutrition_id} 
                    className="food-item" 
                    onClick={() => handleFoodSelect(food.nutrition_id)}
                  >
                    {food.food_item}
                  </div>
                ))
              ) : (
                <div className="no-results">No foods found</div>
              )}
            </div>
          )}

          {selectedFood && (
            <div className="food-details">
              <h3 className="food-name">{selectedFood.food_item}</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Calories:</span>
                  <span className="detail-value">{formatValue(selectedFood.calories)} kcal</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Protein:</span>
                  <span className="detail-value">{formatValue(selectedFood.protein)} g</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Carbs:</span>
                  <span className="detail-value">{formatValue(selectedFood.carbs)} g</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Fat:</span>
                  <span className="detail-value">{formatValue(selectedFood.fat)} g</span>
                </div>
                {selectedFood.fiber && (
                  <div className="detail-item">
                    <span className="detail-label">Fiber:</span>
                    <span className="detail-value">{formatValue(selectedFood.fiber)} g</span>
                  </div>
                )}
                {selectedFood.sugar && (
                  <div className="detail-item">
                    <span className="detail-label">Sugar:</span>
                    <span className="detail-value">{formatValue(selectedFood.sugar)} g</span>
                  </div>
                )}
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
                  disabled={loading}
                >
                  {loading ? 'Saving...' : `Save ${mealType}`}
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
        {loading && !error && <div className="loading">Loading saved meals...</div>}
        {groupedMealsArray.length > 0 ? (
          <div className="saved-meals-list">
            {groupedMealsArray.map((meal) => (
              <div key={meal.id} className="saved-meal-card">
                <div className="saved-meal-header">
                  <h3>{meal.type} - {meal.date}</h3>
                </div>
                <div className="saved-meal-totals">
                  <span>Calories: {formatValue(meal.totals.calories)} kcal</span>
                  <span>Protein: {formatValue(meal.totals.protein)} g</span>
                  <span>Carbs: {formatValue(meal.totals.carbs)} g</span>
                  <span>Fat: {formatValue(meal.totals.fat)} g</span>
                </div>
                <div className="saved-meal-items">
                  {meal.items.map((item) => (
                    <div key={item.intake_id} className="saved-meal-item">
                      <span>{item.name} (x{item.quantity}) - {formatValue(item.calories)} kcal</span>
                      <button 
                        className="delete-item-btn"
                        onClick={() => deleteSavedMeal(item.intake_id)}
                      >
                        ✕
                      </button>
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