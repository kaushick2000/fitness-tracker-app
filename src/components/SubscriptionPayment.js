/* Last Name, First Name - Student ID */
/* 
 Suresh, Kaushick ( 1002237680 ), 
 Sivaprakash, Akshay Prassanna ( 1002198274 ) ,  
 Sonwane, Pratik ( 1002170610 ) , 
 Shaik, Arfan ( 1002260039 ) , 
 Sheth, Jeet ( 1002175315 ) 
*/


import React, { useState, useRef, useEffect } from 'react';
import '../styles/subscriptionpayment.css';
import Nav from '../components/Nav';
import { useNavigate } from 'react-router-dom';

const SubscriptionPayment = () => {
  const navigate = useNavigate();
  
  // Get user ID from localStorage
  const userId = JSON.parse(localStorage.getItem('userId') || '0');
  
  // Load purchased plans from localStorage if available
  const [purchasedPlans, setPurchasedPlans] = useState(() => {
    const savedPlans = localStorage.getItem('purchasedPlans');
    return savedPlans ? JSON.parse(savedPlans) : [];
  });
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Payment data
  const [paymentData, setPaymentData] = useState({
    cardName: "",
    cardNumber: "",
    expDate: "",
    cvv: ""
  });
  
  const paymentSectionRef = useRef(null);

  // Check if user already has a subscription
  useEffect(() => {
    const checkSubscription = async () => {
      if (userId) {
        try {
          const response = await fetch(`http://localhost:3000/api/subscriptions/${userId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.subscription) {
              // If user has a subscription, add it to purchasedPlans
              setPurchasedPlans([data.subscription.plan_purchased]);
            }
          }
        } catch (err) {
          console.error('Error checking subscription:', err);
        }
      }
    };
    
    checkSubscription();
  }, [userId]);

  // Save purchased plans to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('purchasedPlans', JSON.stringify(purchasedPlans));
  }, [purchasedPlans]);

  const handlePayment = (plan) => {
    setSelectedPlan(plan);
    
    // Scroll to payment section
    if (paymentSectionRef.current) {
      paymentSectionRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setPaymentData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };
  
  const formatCardNumber = (value) => {
    // Remove all non-digits
    let v = value.replace(/\D/g, '');
    
    // Add space after every 4 digits
    v = v.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    // Limit to 19 characters (16 digits + 3 spaces)
    v = v.substring(0, 19);
    
    return v;
  };
  
  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setPaymentData(prevData => ({
      ...prevData,
      cardNumber: formattedValue
    }));
  };
  
  const formatExpDate = (value) => {
    // Remove all non-digits
    let v = value.replace(/\D/g, '');
    
    // Add slash after 2 digits
    if (v.length > 2) {
      v = v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    
    // Limit to 5 characters (MM/YY)
    v = v.substring(0, 5);
    
    return v;
  };
  
  const handleExpDateChange = (e) => {
    const formattedValue = formatExpDate(e.target.value);
    setPaymentData(prevData => ({
      ...prevData,
      expDate: formattedValue
    }));
  };
  
  const formatCVV = (value) => {
    // Remove all non-digits and limit to 3 or 4 digits
    let v = value.replace(/\D/g, '');
    v = v.substring(0, 4);
    return v;
  };
  
  const handleCVVChange = (e) => {
    const formattedValue = formatCVV(e.target.value);
    setPaymentData(prevData => ({
      ...prevData,
      cvv: formattedValue
    }));
  };
  
  const validateCardNumber = (cardNumber) => {
    // Remove spaces and check if it's 16 digits
    const stripped = cardNumber.replace(/\s+/g, '');
    return /^\d{16}$/.test(stripped);
  };
  
  const validateExpDate = (expDate) => {
    if (!/^\d{2}\/\d{2}$/.test(expDate)) return false;
    
    const [month, year] = expDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
    const currentMonth = currentDate.getMonth() + 1; // getMonth() is 0-indexed
    
    const expMonth = parseInt(month, 10);
    const expYear = parseInt(year, 10);
    
    // Check if month is valid
    if (expMonth < 1 || expMonth > 12) return false;
    
    // Check if date is in the future
    return (expYear > currentYear || (expYear === currentYear && expMonth >= currentMonth));
  };
  
  const validateCVV = (cvv) => {
    return /^\d{3,4}$/.test(cvv);
  };
  
  const processPayment = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate card details
    if (!validateCardNumber(paymentData.cardNumber)) {
      setError('Please enter a valid 16-digit card number');
      return;
    }
    
    if (!validateExpDate(paymentData.expDate)) {
      setError('Please enter a valid expiration date (MM/YY) in the future');
      return;
    }
    
    if (!validateCVV(paymentData.cvv)) {
      setError('Please enter a valid 3 or 4 digit CVV code');
      return;
    }
    
    // Start loading
    setLoading(true);
    
    try {
      // Prepare subscription data
      const subscriptionData = {
        user_id: userId,
        cardholder: paymentData.cardName,
        card_number: paymentData.cardNumber.replace(/\s+/g, ''), // Remove spaces before storing
        exp_date: formatExpDateForDB(paymentData.expDate),
        cvv: paymentData.cvv,
        plan_purchased: selectedPlan
      };
      
      // Send subscription data to API
      const response = await fetch('http://localhost:3000/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process subscription');
      }
      
      // Successfully subscribed
      setPaymentComplete(true);
      
      // Add the plan to purchased plans if it's not already there
      if (!purchasedPlans.includes(selectedPlan)) {
        const newPurchasedPlans = [...purchasedPlans, selectedPlan];
        setPurchasedPlans(newPurchasedPlans);
        localStorage.setItem('purchasedPlans', JSON.stringify(newPurchasedPlans));
      }
      
      // Reset payment form after 3 seconds and redirect to trainers page
      setTimeout(() => {
        setPaymentComplete(false);
        setSelectedPlan(null);
        navigate('/trainer');
      }, 3000);
      
    } catch (err) {
      console.error('Payment processing error:', err);
      setError(err.message || 'An error occurred processing your payment');
    } finally {
      setLoading(false);
    }
  };
  
  // Format date as ISO string for database
  const formatExpDateForDB = (expDate) => {
    const [month, year] = expDate.split('/');
    const fullYear = '20' + year; // Assuming 20xx for years
    // Set to last day of month to avoid timezone issues
    const lastDay = new Date(fullYear, month, 0).getDate();
    return `${fullYear}-${month.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}T23:59:59Z`;
  };
  
  const isPlanPurchased = (plan) => {
    return purchasedPlans.includes(plan);
  };

  return (
    <div className="page-wrapper">
      {/* Nav component - passing the purchased plans */}
      <div className="nav-container">
        <Nav purchasedPlans={purchasedPlans} />
      </div>
      
      {/* Adding margin to push content to the right of sidebar */}
      <div className="subscription-payment-container">
        {/* Subscription Plans */}
        <div className="subscription-section">
          <h2>Choose Your Fitness Plan</h2>
          <div className="plans-container">
            {/* Beginner Plan */}
            <div className="plan-card">
              <div className="plan-header beginner">
                <h3>Beginner</h3>
              </div>
              <div className="plan-content">
                {/* <ul>
                  <li>✓ Basic workout templates</li>
                  <li>✓ Progress tracking</li>
                  <li>✓ Community support</li>
                  <li>✗ Personalized plans</li>
                  <li>✗ Advanced analytics</li>
                </ul> */}
                <div className="plan-price">
                  <span className="price">$9.99</span>
                  <span className="period">/month</span>
                </div>
                <button 
                  className="plan-button"
                  onClick={() => handlePayment('beginner')}
                  disabled={isPlanPurchased('beginner')}
                >
                  {isPlanPurchased('beginner') ? 'Purchased' : 'Buy Now'}
                </button>
              </div>
            </div>
            
            {/* Intermediate Plan */}
            <div className="plan-card featured">
              <div className="plan-badge">Most Popular</div>
              <div className="plan-header intermediate">
                <h3>Intermediate</h3>
              </div>
              <div className="plan-content">
                {/* <ul>
                  <li>✓ All Beginner features</li>
                  <li>✓ Personalized workout plans</li>
                  <li>✓ Nutrition tracking</li>
                  <li>✓ Weekly progress reports</li>
                  <li>✗ 1-on-1 coaching</li>
                </ul> */}
                <div className="plan-price">
                  <span className="price">$19.99</span>
                  <span className="period">/month</span>
                </div>
                <button 
                  className="plan-button"
                  onClick={() => handlePayment('intermediate')}
                  disabled={isPlanPurchased('intermediate')}
                >
                  {isPlanPurchased('intermediate') ? 'Purchased' : 'Buy Now'}
                </button>
              </div>
            </div>
            
            {/* Advanced Plan */}
            <div className="plan-card">
              <div className="plan-header advanced">
                <h3>Advanced</h3>
              </div>
              <div className="plan-content">
                {/* <ul>
                  <li>✓ All Intermediate features</li>
                  <li>✓ Advanced performance analytics</li>
                  <li>✓ 1-on-1 coaching sessions</li>
                  <li>✓ Custom nutrition plans</li>
                  <li>✓ Priority support</li>
                </ul> */}
                <div className="plan-price">
                  <span className="price">$29.99</span>
                  <span className="period">/month</span>
                </div>
                <button 
                  className="plan-button"
                  onClick={() => handlePayment('advanced')}
                  disabled={isPlanPurchased('advanced')}
                >
                  {isPlanPurchased('advanced') ? 'Purchased' : 'Buy Now'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Trainer Access Notice */}
          {purchasedPlans.length > 0 ? (
            <div className="trainer-access-notice">
              <h3>🎉 Trainer Access Unlocked!</h3>
              <p>You now have access to our personal trainer features. Check the Trainer section in the navigation menu.</p>
            </div>
          ) : (
            <div className="trainer-access-notice locked">
              <h3>🔒 Trainer Access Locked</h3>
              <p>Purchase any plan to unlock access to our personal trainers and customized workout programs.</p>
            </div>
          )}
        </div>
        
        {/* Payment Section */}
        <div 
          ref={paymentSectionRef}
          className={`payment-section ${selectedPlan ? 'active' : ''}`}
          id="payment"
        >
          <h2>Complete Your Payment</h2>
          {selectedPlan && !paymentComplete ? (
            <div className="payment-container">
              <div className="order-summary">
                <h3>Order Summary</h3>
                <div className="order-details">
                  <div className="order-item">
                    <span>{selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan</span>
                    <span className="order-price">
                      ${selectedPlan === 'beginner' ? '9.99' : selectedPlan === 'intermediate' ? '19.99' : '29.99'}
                    </span>
                  </div>
                  <div className="order-total">
                    <span>Total</span>
                    <span className="order-price">
                      ${selectedPlan === 'beginner' ? '9.99' : selectedPlan === 'intermediate' ? '19.99' : '29.99'}
                    </span>
                  </div>
                </div>
              </div>
              
              <form className="payment-form" onSubmit={processPayment}>
                {error && <div className="error-message">{error}</div>}
                
                <div className="form-group">
                  <label htmlFor="cardName">Name on Card</label>
                  <input 
                    type="text" 
                    id="cardName" 
                    value={paymentData.cardName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="cardNumber">Card Number</label>
                  <input 
                    type="text" 
                    id="cardNumber" 
                    value={paymentData.cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    required 
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="expDate">Expiration Date</label>
                    <input 
                      type="text" 
                      id="expDate" 
                      value={paymentData.expDate}
                      onChange={handleExpDateChange}
                      placeholder="MM/YY"
                      maxLength="5"
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="cvv">CVV</label>
                    <input 
                      type="text" 
                      id="cvv" 
                      value={paymentData.cvv}
                      onChange={handleCVVChange}
                      placeholder="123"
                      maxLength="4"
                      required 
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="payment-button"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Complete Payment'}
                </button>
              </form>
            </div>
          ) : paymentComplete ? (
            <div className="payment-success">
              <div className="success-icon">✓</div>
              <h3>Payment Successful!</h3>
              <p>Thank you for purchasing the {selectedPlan} plan!</p>
              <p>Your subscription is now active and you've unlocked Trainer access.</p>
              <p>Redirecting to Trainer page...</p>
            </div>
          ) : (
            <p className="select-plan-message">Select a plan above to proceed with payment</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPayment;

// import React, { useState, useRef, useEffect } from 'react';
// import '../styles/subscriptionpayment.css';
// import Nav from '../components/Nav';

// const SubscriptionPayment = () => {
//   // Load purchased plans from localStorage if available
//   const [purchasedPlans, setPurchasedPlans] = useState(() => {
//     const savedPlans = localStorage.getItem('purchasedPlans');
//     return savedPlans ? JSON.parse(savedPlans) : [];
//   });
  
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [paymentComplete, setPaymentComplete] = useState(false);
  
//   // Payment data
//   const [paymentData, setPaymentData] = useState({
//     cardName: "John Doe",
//     cardNumber: "4111 1111 1111 1111",
//     expDate: "12/25",
//     cvv: "123"
//   });
  
//   const paymentSectionRef = useRef(null);

//   // Save purchased plans to localStorage whenever it changes
//   useEffect(() => {
//     localStorage.setItem('purchasedPlans', JSON.stringify(purchasedPlans));
//   }, [purchasedPlans]);

//   const handlePayment = (plan) => {
//     setSelectedPlan(plan);
    
//     // Scroll to payment section
//     if (paymentSectionRef.current) {
//       paymentSectionRef.current.scrollIntoView({ 
//         behavior: 'smooth',
//         block: 'start'
//       });
//     }
//   };
  
//   const handleInputChange = (e) => {
//     const { id, value } = e.target;
//     setPaymentData(prevData => ({
//       ...prevData,
//       [id]: value
//     }));
//   };
  
//   const processPayment = (e) => {
//     e.preventDefault();
//     // Simulate payment processing
//     setTimeout(() => {
//       setPaymentComplete(true);
      
//       // Add the plan to purchased plans if it's not already there
//       if (!purchasedPlans.includes(selectedPlan)) {
//         setPurchasedPlans([...purchasedPlans, selectedPlan]);
//       }
      
//       // Reset payment form after 3 seconds
//       setTimeout(() => {
//         setPaymentComplete(false);
//         setSelectedPlan(null);
//       }, 3000);
//     }, 1500);
//   };
  
//   const isPlanPurchased = (plan) => {
//     return purchasedPlans.includes(plan);
//   };

//   return (
//     <div className="page-wrapper">
//       {/* Nav component - passing the purchased plans */}
//       <div className="nav-container">
//         <Nav purchasedPlans={purchasedPlans} />
//       </div>
      
//       {/* Adding margin to push content to the right of sidebar */}
//       <div className="subscription-payment-container">
//         {/* Subscription Plans */}
//         <div className="subscription-section">
//           <h2>Choose Your Fitness Plan</h2>
//           <div className="plans-container">
//             {/* Beginner Plan */}
//             <div className="plan-card">
//               <div className="plan-header beginner">
//                 <h3>Beginner</h3>
//               </div>
//               <div className="plan-content">
//                 <ul>
//                   <li>✓ Basic workout templates</li>
//                   <li>✓ Progress tracking</li>
//                   <li>✓ Community support</li>
//                   <li>✗ Personalized plans</li>
//                   <li>✗ Advanced analytics</li>
//                 </ul>
//                 <div className="plan-price">
//                   <span className="price">$9.99</span>
//                   <span className="period">/month</span>
//                 </div>
//                 <button 
//                   className="plan-button"
//                   onClick={() => handlePayment('beginner')}
//                   disabled={isPlanPurchased('beginner')}
//                 >
//                   {isPlanPurchased('beginner') ? 'Purchased' : 'Buy Now'}
//                 </button>
//               </div>
//             </div>
            
//             {/* Intermediate Plan */}
//             <div className="plan-card featured">
//               <div className="plan-badge">Most Popular</div>
//               <div className="plan-header intermediate">
//                 <h3>Intermediate</h3>
//               </div>
//               <div className="plan-content">
//                 <ul>
//                   <li>✓ All Beginner features</li>
//                   <li>✓ Personalized workout plans</li>
//                   <li>✓ Nutrition tracking</li>
//                   <li>✓ Weekly progress reports</li>
//                   <li>✗ 1-on-1 coaching</li>
//                 </ul>
//                 <div className="plan-price">
//                   <span className="price">$19.99</span>
//                   <span className="period">/month</span>
//                 </div>
//                 <button 
//                   className="plan-button"
//                   onClick={() => handlePayment('intermediate')}
//                   disabled={isPlanPurchased('intermediate')}
//                 >
//                   {isPlanPurchased('intermediate') ? 'Purchased' : 'Buy Now'}
//                 </button>
//               </div>
//             </div>
            
//             {/* Advanced Plan */}
//             <div className="plan-card">
//               <div className="plan-header advanced">
//                 <h3>Advanced</h3>
//               </div>
//               <div className="plan-content">
//                 <ul>
//                   <li>✓ All Intermediate features</li>
//                   <li>✓ Advanced performance analytics</li>
//                   <li>✓ 1-on-1 coaching sessions</li>
//                   <li>✓ Custom nutrition plans</li>
//                   <li>✓ Priority support</li>
//                 </ul>
//                 <div className="plan-price">
//                   <span className="price">$29.99</span>
//                   <span className="period">/month</span>
//                 </div>
//                 <button 
//                   className="plan-button"
//                   onClick={() => handlePayment('advanced')}
//                   disabled={isPlanPurchased('advanced')}
//                 >
//                   {isPlanPurchased('advanced') ? 'Purchased' : 'Buy Now'}
//                 </button>
//               </div>
//             </div>
//           </div>
          
//           {/* Trainer Access Notice */}
//           {purchasedPlans.length > 0 ? (
//             <div className="trainer-access-notice">
//               <h3>🎉 Trainer Access Unlocked!</h3>
//               <p>You now have access to our personal trainer features. Check the Trainer section in the navigation menu.</p>
//             </div>
//           ) : (
//             <div className="trainer-access-notice locked">
//               <h3>🔒 Trainer Access Locked</h3>
//               <p>Purchase any plan to unlock access to our personal trainers and customized workout programs.</p>
//             </div>
//           )}
//         </div>
        
//         {/* Payment Section */}
//         <div 
//           ref={paymentSectionRef}
//           className={`payment-section ${selectedPlan ? 'active' : ''}`}
//           id="payment"
//         >
//           <h2>Complete Your Payment</h2>
//           {selectedPlan && !paymentComplete ? (
//             <div className="payment-container">
//               <div className="order-summary">
//                 <h3>Order Summary</h3>
//                 <div className="order-details">
//                   <div className="order-item">
//                     <span>{selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan</span>
//                     <span className="order-price">
//                       ${selectedPlan === 'beginner' ? '9.99' : selectedPlan === 'intermediate' ? '19.99' : '29.99'}
//                     </span>
//                   </div>
//                   <div className="order-total">
//                     <span>Total</span>
//                     <span className="order-price">
//                       ${selectedPlan === 'beginner' ? '9.99' : selectedPlan === 'intermediate' ? '19.99' : '29.99'}
//                     </span>
//                   </div>
//                 </div>
//               </div>
              
//               <form className="payment-form" onSubmit={processPayment}>
//                 <div className="form-group">
//                   <label htmlFor="cardName">Name on Card</label>
//                   <input 
//                     type="text" 
//                     id="cardName" 
//                     value={paymentData.cardName}
//                     onChange={handleInputChange}
//                     required 
//                   />
//                 </div>
                
//                 <div className="form-group">
//                   <label htmlFor="cardNumber">Card Number</label>
//                   <input 
//                     type="text" 
//                     id="cardNumber" 
//                     value={paymentData.cardNumber}
//                     onChange={handleInputChange}
//                     required 
//                   />
//                 </div>
                
//                 <div className="form-row">
//                   <div className="form-group">
//                     <label htmlFor="expDate">Expiration Date</label>
//                     <input 
//                       type="text" 
//                       id="expDate" 
//                       value={paymentData.expDate}
//                       onChange={handleInputChange}
//                       required 
//                     />
//                   </div>
                  
//                   <div className="form-group">
//                     <label htmlFor="cvv">CVV</label>
//                     <input 
//                       type="text" 
//                       id="cvv" 
//                       value={paymentData.cvv}
//                       onChange={handleInputChange}
//                       required 
//                     />
//                   </div>
//                 </div>
                
//                 <button type="submit" className="payment-button">
//                   Complete Payment
//                 </button>
//               </form>
//             </div>
//           ) : paymentComplete ? (
//             <div className="payment-success">
//               <div className="success-icon">✓</div>
//               <h3>Payment Successful!</h3>
//               <p>Thank you for purchasing the {selectedPlan} plan!</p>
//               <p>Your subscription is now active and you've unlocked Trainer access.</p>
//             </div>
//           ) : (
//             <p className="select-plan-message">Select a plan above to proceed with payment</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SubscriptionPayment;