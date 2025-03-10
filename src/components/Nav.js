import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/nav.css';

const Nav = ({ purchasedPlans = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeNavItem, setActiveNavItem] = useState(() => {
    const path = location.pathname;
    if (path.includes('home')) return 'home';
    if (path.includes('dashboard')) return 'dashboard';
    if (path.includes('activitylogging')) return 'activity';
    if (path.includes('progress')) return 'progress';
    if (path.includes('analytics')) return 'analytics';
    if (path.includes('plans')) return 'plans';
    if (path.includes('profile')) return 'profile';
    if (path.includes('contact')) return 'contact';
    if (path.includes('trainer')) return 'trainer';
    return 'dashboard'; // Default
  });

  // Check if any plan has been purchased
  const hasActivePlan = purchasedPlans && purchasedPlans.length > 0;

  // Update activeNavItem when the route changes
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('home')) setActiveNavItem('home');
    else if (path.includes('dashboard')) setActiveNavItem('dashboard');
    else if (path.includes('activitylogging')) setActiveNavItem('activity');
    else if (path.includes('progress')) setActiveNavItem('progress');
    else if (path.includes('analytics')) setActiveNavItem('analytics');
    else if (path.includes('plans')) setActiveNavItem('plans');
    else if (path.includes('profile')) setActiveNavItem('profile');
    else if (path.includes('contact')) setActiveNavItem('contact');
    else if (path.includes('trainer')) setActiveNavItem('trainer');
    else setActiveNavItem('dashboard');
  }, [location.pathname]);

  const handleNavigation = (route) => {
    // Don't navigate to trainer if no plan is purchased
    if (route === 'trainer' && !hasActivePlan) {
      return;
    }

    setActiveNavItem(route);
    
    // Navigate to the corresponding route based on the nav item
    switch(route) {
      case 'home':
        navigate('/home');
        break;
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'activity':
        navigate('/activitylogging');
        break;
      case 'progress':
        navigate('/progress');
        break;
      case 'plans':
        navigate('/plans');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'analytics':
        navigate('/analytics');
        break;
      case 'contact':
        navigate('/contact');
        break;
      case 'trainer':
        navigate('/trainer');
        break;
      default:
        navigate('/dashboard');
    }
  };

  return (
    <div className="sidebar">
      <div className="logo">
        <h2>FITNESS TRACKER</h2>
      </div>
      <div className="nav-items">
        <div 
          className={`nav-item ${activeNavItem === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleNavigation('dashboard')}
        >
          <div className="nav-icon">📊</div>
          <span>Dashboard</span>
        </div>
        <div 
          className={`nav-item ${activeNavItem === 'activity' ? 'active' : ''}`}
          onClick={() => handleNavigation('activity')}
        >
          <div className="nav-icon">🏃</div>
          <span>Activity Logging</span>
        </div>
        <div 
          className={`nav-item ${activeNavItem === 'progress' ? 'active' : ''}`}
          onClick={() => handleNavigation('progress')}
        >
          <div className="nav-icon">📈</div> 
          <span>Progress</span>
        </div>
        <div 
          className={`nav-item ${activeNavItem === 'plans' ? 'active' : ''}`}
          onClick={() => handleNavigation('plans')}
        >
          <div className="nav-icon">💰</div>
          <span>Plans</span>
        </div>
        <div 
          className={`nav-item ${activeNavItem === 'trainer' ? 'active' : ''} ${!hasActivePlan ? 'disabled' : ''}`}
          onClick={() => handleNavigation('trainer')}
          title={!hasActivePlan ? 'Purchase a plan to access personal trainer' : ''}
        >
          <div className="nav-icon">👨‍🏫</div>
          <span>Trainer</span>
          {!hasActivePlan && <div className="locked-icon">🔒</div>}
        </div>
        <div 
          className={`nav-item ${activeNavItem === 'analytics' ? 'active' : ''}`}
          onClick={() => handleNavigation('analytics')}
        >
          <div className="nav-icon">🔎</div>
          <span>Analytics</span>
        </div>
        <div 
          className={`nav-item ${activeNavItem === 'profile' ? 'active' : ''}`}
          onClick={() => handleNavigation('profile')}
        >
          <div className="nav-icon">👤</div>
          <span>Profile</span>
        </div>
        <div 
          className={`nav-item ${activeNavItem === 'contact' ? 'active' : ''}`}
          onClick={() => handleNavigation('contact')}
        >
          <div className="nav-icon">📞</div>
          <span>Contact Us</span>
        </div>
      </div>
    </div>
  );
};

export default Nav;

// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import '../styles/nav.css';

// const Nav = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [activeNavItem, setActiveNavItem] = useState(() => {
//     const path = location.pathname;
//     if (path.includes('home')) return 'home';
//     if (path.includes('dashboard')) return 'dashboard';
//     if (path.includes('activitylogging')) return 'activity';
//     if (path.includes('progress')) return 'progress';
//     if (path.includes('analytics')) return 'analytics';
//     if (path.includes('plans')) return 'plans';
//     if (path.includes('profile')) return 'profile';
//     if (path.includes('contact')) return 'contact';
//     return 'dashboard'; // Default
//   });

//   // Update activeNavItem when the route changes
//   useEffect(() => {
//     const path = location.pathname;
//     if (path.includes('home')) setActiveNavItem('home');
//     else if (path.includes('dashboard')) setActiveNavItem('dashboard');
//     else if (path.includes('activitylogging')) setActiveNavItem('activity');
//     else if (path.includes('progress')) setActiveNavItem('progress');
//     else if (path.includes('analytics')) setActiveNavItem('analytics');
//     else if (path.includes('plans')) setActiveNavItem('plans');
//     else if (path.includes('profile')) setActiveNavItem('profile');
//     else if (path.includes('contact')) setActiveNavItem('contact');
//     else setActiveNavItem('dashboard');
//   }, [location.pathname]);

//   const handleNavigation = (route) => {
//     setActiveNavItem(route);
    
//     // Navigate to the corresponding route based on the nav item
//     switch(route) {
//       case 'home':
//         navigate('/home');
//         break;
//       case 'dashboard':
//         navigate('/dashboard');
//         break;
//       case 'activity':
//         navigate('/activitylogging');
//         break;
//       case 'progress':
//         navigate('/progress');
//         break;
//       case 'plans':
//           navigate('/plans');
//           break;
//       case 'profile':
//         navigate('/profile');
//         break;
//       case 'analytics':
//         navigate('/analytics');
//         break;
//       case 'contact':
//         navigate('/contact');
//         break;
//       default:
//         navigate('/dashboard');
//     }
//   };

//   return (
//     <div className="sidebar">
//       <div className="logo">
//         <h2>FITNESS TRACKER</h2>
//       </div>
//       <div className="nav-items">
//         <div 
//           className={`nav-item ${activeNavItem === 'dashboard' ? 'active' : ''}`}
//           onClick={() => handleNavigation('dashboard')}
//         >
//           <div className="nav-icon">📊</div>
//           <span>Dashboard</span>
//         </div>
//         <div 
//           className={`nav-item ${activeNavItem === 'activity' ? 'active' : ''}`}
//           onClick={() => handleNavigation('activity')}
//         >
//           <div className="nav-icon">🏃</div>
//           <span>Activity Logging</span>
//         </div>
//         <div 
//           className={`nav-item ${activeNavItem === 'progress' ? 'active' : ''}`}
//           onClick={() => handleNavigation('progress')}
//         >
//           <div className="nav-icon">📈</div> 
//           <span>Progress</span>

//         </div>
//         <div 
//           className={`nav-item ${activeNavItem === 'plans' ? 'active' : ''}`}
//           onClick={() => handleNavigation('plans')}
//         >
//           <div className="nav-icon">💰</div> {/* Changed icon for clarity */}
//           <span>plans</span>
//         </div>
//         <div 
//           className={`nav-item ${activeNavItem === 'analytics' ? 'active' : ''}`}
//           onClick={() => handleNavigation('analytics')}
//         >
//           <div className="nav-icon">🔎</div>
//           <span>Analytics</span>
//         </div>
//         <div 
//           className={`nav-item ${activeNavItem === 'profile' ? 'active' : ''}`}
//           onClick={() => handleNavigation('profile')}
//         >
//           <div className="nav-icon">👤</div>
//           <span>Profile</span>
//         </div>
//         <div 
//           className={`nav-item ${activeNavItem === 'contact' ? 'active' : ''}`}
//           onClick={() => handleNavigation('contact')}
//         >
//           <div className="nav-icon">📞</div>
//           <span>Contact Us</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Nav;


// // import React, { useState } from 'react';
// // import { useNavigate, useLocation } from 'react-router-dom';
// // import '../styles/nav.css'

// // const Nav = () => {
// //   const navigate = useNavigate();
// //   const location = useLocation();
// //   const [activeNavItem, setActiveNavItem] = useState(() => {
// //     // Set the active nav item based on the current path
// //     const path = location.pathname;
// //     if (path.includes('home')) return 'home';
// //     if (path.includes('dashboard')) return 'dashboard';
// //     if (path.includes('activitylogging')) return 'activity';
// //     if (path.includes('profile')) return 'profile';
// //     return 'dashboard'; // Default
// //   });

// //   const handleNavigation = (route) => {
// //     setActiveNavItem(route);
    
// //     // Navigate to the corresponding route based on the nav item
// //     switch(route) {
// //       case 'home':
// //         navigate('/home');
// //         break;
// //       case 'dashboard':
// //         navigate('/dashboard');
// //         break;
// //       case 'activity':
// //         navigate('/activitylogging');
// //         break;
// //         case 'progress':
// //         navigate('/progress');
// //         break;
// //       case 'profile':
// //         // For now, we'll keep this on dashboard since there's no profile route yet
// //         navigate('/dashboard');
// //         break;
// //       default:
// //         navigate('/dashboard');
// //     }
// //   };

// //   return (
// //     <div className="sidebar">
// //       <div className="logo">
// //         <h2>FITNESS TRACKER</h2>
// //       </div>
// //       <div className="nav-items">
// //         <div 
// //           className={`nav-item ${activeNavItem === 'home' ? 'active' : ''}`}
// //           onClick={() => handleNavigation('home')}
// //         >
// //           <div className="nav-icon">🏠</div>
// //           <span>Home</span>
// //         </div>
// //         <div 
// //           className={`nav-item ${activeNavItem === 'dashboard' ? 'active' : ''}`}
// //           onClick={() => handleNavigation('dashboard')}
// //         >
// //           <div className="nav-icon">📊</div>
// //           <span>Dashboard</span>
// //         </div>
// //         <div 
// //           className={`nav-item ${activeNavItem === 'activity' ? 'active' : ''}`}
// //           onClick={() => handleNavigation('activity')}
// //         >
// //           <div className="nav-icon">🏃</div>
// //           <span>Activity Logging</span>
// //         </div>
// //         <div 
// //           className={`nav-item ${activeNavItem === 'progress' ? 'active' : ''}`}
// //           onClick={() => handleNavigation('progress')}
// //         >
// //           <div className="nav-icon">🏃</div>
// //           <span>Progress</span>
// //         </div>
// //         <div 
// //           className={`nav-item ${activeNavItem === 'profile' ? 'active' : ''}`}
// //           onClick={() => handleNavigation('profile')}
// //         >
// //           <div className="nav-icon">👤</div>
// //           <span>Profile</span>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Nav;