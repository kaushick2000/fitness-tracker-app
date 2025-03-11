/* Last Name, First Name - Student ID */
/* 
 Suresh, Kaushick ( 1002237680 ), 
 Sivaprakash, Akshay Prassanna ( 1002198274 ) ,  
 Sonwane, Pratik ( 1002170610 ) , 
 Shaik, Arfan ( 1002260039 ) , 
 Sheth, Jeet ( 1002175315 ) 
*/

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/nav.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons"; // Import icons
import { getAuth, signOut } from "firebase/auth";
import { toast } from "react-toastify";

const Nav = ({ purchasedPlans = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeNavItem, setActiveNavItem] = useState(() => {
    const path = location.pathname;
    if (path.includes("home")) return "home";
    if (path.includes("dashboard")) return "dashboard";
    if (path.includes("activitylogging")) return "activity";
    if (path.includes("progress")) return "progress";
    if (path.includes("analytics")) return "analytics";
    if (path.includes("plans")) return "plans";
    if (path.includes("profile")) return "profile";
    if (path.includes("contact")) return "contact";
    if (path.includes("trainer")) return "trainer";
    if (path.includes("nutrition")) return "nutrition";
    return "dashboard"; // Default
  });

  const [isSidebarActive, setIsSidebarActive] = useState(false); // State for sidebar visibility

  // Check if any plan has been purchased
  const hasActivePlan = purchasedPlans && purchasedPlans.length > 0;

  // Update activeNavItem when the route changes
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("home")) setActiveNavItem("home");
    else if (path.includes("dashboard")) setActiveNavItem("dashboard");
    else if (path.includes("activitylogging")) setActiveNavItem("activity");
    else if (path.includes("progress")) setActiveNavItem("progress");
    else if (path.includes("analytics")) setActiveNavItem("analytics");
    else if (path.includes("plans")) setActiveNavItem("plans");
    else if (path.includes("profile")) setActiveNavItem("profile");
    else if (path.includes("contact")) setActiveNavItem("contact");
    else if (path.includes("trainer")) setActiveNavItem("trainer");
    else if (path.includes("nutrition")) setActiveNavItem("nutrition");
    else setActiveNavItem("dashboard");
  }, [location.pathname]);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigate("/login"); // or wherever you want to redirect after logout
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  const handleNavigation = (route) => {
    // Don't navigate to trainer if no plan is purchased
    if (route === "trainer" && !hasActivePlan) {
      return;
    }
    setActiveNavItem(route);
    // Navigate to the corresponding route based on the nav item
    switch (route) {
      case "home":
        navigate("/home");
        break;
      case "dashboard":
        navigate("/dashboard");
        break;
      case "activity":
        navigate("/activitylogging");
        break;
      case "progress":
        navigate("/progress");
        break;
      case "plans":
        navigate("/plans");
        break;
      case "profile":
        navigate("/profile");
        break;
      case "analytics":
        navigate("/analytics");
        break;
      case "contact":
        navigate("/contact");
        break;
      case "trainer":
        navigate("/trainer");
        break;
      case "nutrition":
        navigate("/nutrition");
        break;
      default:
        navigate("/dashboard");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarActive(!isSidebarActive);
  };

  return (
    <>
      {!isSidebarActive && (
        <div className="mobile-menu" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={isSidebarActive ? faTimes : faBars} />
        </div>
      )}
      <div className={`sidebar ${isSidebarActive ? "active" : ""}`}>
        <div className="logo">
          <h2>Fitness Tracker</h2>
        </div>
        <div className="nav-items">
          {/* <a
            className={`nav-item ${activeNavItem === "home" ? "active" : ""}`}
            onClick={() => handleNavigation("home")}
          >
            <span className="nav-icon">🏠</span>
            <span>Home</span>
          </a> */}
          <a
            className={`nav-item ${
              activeNavItem === "dashboard" ? "active" : ""
            }`}
            onClick={() => handleNavigation("dashboard")}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </a>
          <a
            className={`nav-item ${
              activeNavItem === "activity" ? "active" : ""
            }`}
            onClick={() => handleNavigation("activity")}
          >
            <span className="nav-icon">🏃</span>
            <span>Activity</span>
          </a>
          <a
            className={`nav-item ${
              activeNavItem === "progress" ? "active" : ""
            }`}
            onClick={() => handleNavigation("progress")}
          >
            <span className="nav-icon">📈</span>
            <span>Progress</span>
          </a>
          <a
            className={`nav-item ${
              activeNavItem === "analytics" ? "active" : ""
            }`}
            onClick={() => handleNavigation("analytics")}
          >
            <span className="nav-icon">🔬</span>
            <span>Analytics</span>
          </a>
          <div
            className={`nav-item ${
              activeNavItem === "nutrition" ? "active" : ""
            }`}
            onClick={() => handleNavigation("nutrition")}
          >
            <div className="nav-icon">🥗</div>
            <span>Nutrition</span>
          </div>
          <a
            className={`nav-item ${activeNavItem === "plans" ? "active" : ""}`}
            onClick={() => handleNavigation("plans")}
          >
            <span className="nav-icon">💰</span>
            <span>Plans</span>
          </a>
          <a
            className={`nav-item ${
              activeNavItem === "profile" ? "active" : ""
            }`}
            onClick={() => handleNavigation("profile")}
          >
            <span className="nav-icon">👤</span>
            <span>Profile</span>
          </a>
          <a
            className={`nav-item ${
              activeNavItem === "contact" ? "active" : ""
            }`}
            onClick={() => handleNavigation("contact")}
          >
            <span className="nav-icon">✉️</span>
            <span>Contact</span>
          </a>

          {hasActivePlan && (
            <a
              className={`nav-item ${
                activeNavItem === "trainer" ? "active" : ""
              }`}
              onClick={() => handleNavigation("trainer")}
            >
              <span className="nav-icon">🧑‍🏫</span>
              <span>Trainer</span>
            </a>
          )}

          <a className="nav-item logout" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </a>
        </div>
      </div>
    </>
  );
};

export default Nav;
