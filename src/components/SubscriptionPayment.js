import React, { useState, useRef, useEffect } from 'react';
import '../styles/subscriptionpayment.css';
import Nav from '../components/Nav';

const SubscriptionPayment = () => {
  // Load purchased plans from localStorage if available
  const [purchasedPlans, setPurchasedPlans] = useState(() => {
    const savedPlans = localStorage.getItem('purchasedPlans');
    return savedPlans ? JSON.parse(savedPlans) : [];
  });
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  
  // Payment data
  const [paymentData, setPaymentData] = useState({
    cardName: "John Doe",
    cardNumber: "4111 1111 1111 1111",
    expDate: "12/25",
    cvv: "123"
  });
  
  const paymentSectionRef = useRef(null);

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
  
  const processPayment = (e) => {
    e.preventDefault();
    // Simulate payment processing
    setTimeout(() => {
      setPaymentComplete(true);
      
      // Add the plan to purchased plans if it's not already there
      if (!purchasedPlans.includes(selectedPlan)) {
        setPurchasedPlans([...purchasedPlans, selectedPlan]);
      }
      
      // Reset payment form after 3 seconds
      setTimeout(() => {
        setPaymentComplete(false);
        setSelectedPlan(null);
      }, 3000);
    }, 1500);
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
                <ul>
                  <li>✓ Basic workout templates</li>
                  <li>✓ Progress tracking</li>
                  <li>✓ Community support</li>
                  <li>✗ Personalized plans</li>
                  <li>✗ Advanced analytics</li>
                </ul>
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
                <ul>
                  <li>✓ All Beginner features</li>
                  <li>✓ Personalized workout plans</li>
                  <li>✓ Nutrition tracking</li>
                  <li>✓ Weekly progress reports</li>
                  <li>✗ 1-on-1 coaching</li>
                </ul>
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
                <ul>
                  <li>✓ All Intermediate features</li>
                  <li>✓ Advanced performance analytics</li>
                  <li>✓ 1-on-1 coaching sessions</li>
                  <li>✓ Custom nutrition plans</li>
                  <li>✓ Priority support</li>
                </ul>
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
                <div className="form-group">
                  <label htmlFor="cardName">Name on Card</label>
                  <input 
                    type="text" 
                    id="cardName" 
                    value={paymentData.cardName}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="cardNumber">Card Number</label>
                  <input 
                    type="text" 
                    id="cardNumber" 
                    value={paymentData.cardNumber}
                    onChange={handleInputChange}
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
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="cvv">CVV</label>
                    <input 
                      type="text" 
                      id="cvv" 
                      value={paymentData.cvv}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>
                
                <button type="submit" className="payment-button">
                  Complete Payment
                </button>
              </form>
            </div>
          ) : paymentComplete ? (
            <div className="payment-success">
              <div className="success-icon">✓</div>
              <h3>Payment Successful!</h3>
              <p>Thank you for purchasing the {selectedPlan} plan!</p>
              <p>Your subscription is now active and you've unlocked Trainer access.</p>
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


// import React, { useState, useRef } from 'react';
// import '../styles/subscriptionpayment.css';
// import Nav from '../components/Nav';

// const SubscriptionPayment = () => {
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [paymentComplete, setPaymentComplete] = useState(false);
//   const [purchasedPlans, setPurchasedPlans] = useState([]);
  
//   // Payment data
//   const [paymentData, setPaymentData] = useState({
//     cardName: "John Doe",
//     cardNumber: "4111 1111 1111 1111",
//     expDate: "12/25",
//     cvv: "123"
//   });
  
//   const paymentSectionRef = useRef(null);

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
//       setPurchasedPlans([...purchasedPlans, selectedPlan]);
      
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
//       {/* Nav component - keeping the original Nav */}
//       <div className="nav-container">
//         <Nav />
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
//               <p>Your subscription is now active.</p>
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