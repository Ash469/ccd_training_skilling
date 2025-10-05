import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faSignOutAlt,
  faBars,
  faTimes,
  faChevronDown,
  faChevronUp,
  faCalendarAlt,
  faComments,
  faUser
} from "@fortawesome/free-solid-svg-icons";

export default function UserNavbar({ darkMode, toggleDarkMode, user }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [eventsDropdown, setEventsDropdown] = useState(false);
  const [interviewsDropdown, setInterviewsDropdown] = useState(false);

  const handleNavigation = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

// If user.isTnSStudent is undefined or null, default to true
const isTnSStudent = user?.isTnSStudent;


  return (
    <nav
      className={`shadow-sm p-4 transition-colors duration-200 ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img src="/logo.png" alt="CCD Logo" className="h-12 w-auto mr-3" />
          <h1
            className={`text-xl font-semibold ${
              darkMode ? "text-purple-400" : "text-purple-600"
            }`}
          >
            Training and Skilling Portal
          </h1>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-md"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <FontAwesomeIcon icon={faTimes} className={darkMode ? "text-white" : "text-gray-800"} />
          ) : (
            <FontAwesomeIcon icon={faBars} className={darkMode ? "text-white" : "text-gray-800"} />
          )}
        </button>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-4"> 
          {/* Events Dropdown - Only show for T&S students */} 
          {isTnSStudent !== false && ( 
            <div className="relative">
              <button
                onClick={() => setEventsDropdown((v) => !v)}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-1 transition-all duration-200 ${
                  darkMode
                    ? "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                    : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                }`}
              >
                <FontAwesomeIcon icon={faCalendarAlt} />
                Events
                <FontAwesomeIcon icon={eventsDropdown ? faChevronUp : faChevronDown} className="ml-1" />
              </button>
              {eventsDropdown && (
                <div className={`absolute z-10 mt-2 w-48 rounded shadow-lg ${darkMode ? "bg-gray-700" : "bg-white"}`}>
                  <button
                    onClick={() => { navigate("/user/dashboard"); setEventsDropdown(false); }}
                    className="block w-full text-left px-4 py-2 hover:bg-purple-100 dark:hover:bg-purple-900"
                  >
                    Browse Events
                  </button>
                  <button
                    onClick={() => { navigate("/user/registration"); setEventsDropdown(false); }}
                    className="block w-full text-left px-4 py-2 hover:bg-purple-100 dark:hover:bg-purple-900"
                  >
                    My Registrations
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Interviews Dropdown - Always visible */}
          <div className="relative">
            <button
              onClick={() => setInterviewsDropdown((v) => !v)}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-1 transition-all duration-200 ${
                darkMode
                  ? "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                  : "bg-purple-50 text-purple-600 hover:bg-purple-100"
              }`}
            >
              <FontAwesomeIcon icon={faComments} />
              Mock Interviews
              <FontAwesomeIcon icon={interviewsDropdown ? faChevronUp : faChevronDown} className="ml-1" />
            </button>
            {interviewsDropdown && (
              <div className={`absolute z-10 mt-2 w-48 rounded shadow-lg ${darkMode ? "bg-gray-700" : "bg-white"}`}>
                <button
                  onClick={() => { navigate("/user/panel-registration"); setInterviewsDropdown(false); }}
                  className="block w-full text-left px-4 py-2 hover:bg-purple-100 dark:hover:bg-purple-900"
                >
                  Register for Mock Interview Panel
                </button>
                <button
                  onClick={() => { navigate("/user/my-interview-schedule"); setInterviewsDropdown(false); }}
                  className="block w-full text-left px-4 py-2 hover:bg-purple-100 dark:hover:bg-purple-900"
                >
                  My Mock Interview Schedule
                </button>
              </div>
            )}
          </div>

          <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
            Welcome {user?.fullName || "User"}
          </span>
          <button
            onClick={() => handleNavigation("/user/profile")}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium transition-transform hover:scale-110 ${
              darkMode
                ? "bg-purple-600 hover:bg-purple-500"
                : "bg-purple-700 hover:bg-purple-600"
            }`}
            aria-label="View Profile"
          >
            {user?.fullName ? user.fullName[0].toUpperCase() : <FontAwesomeIcon icon={faUser} />}
          </button>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-all duration-200 ${
              darkMode
                ? "hover:bg-gray-700 text-yellow-400 hover:text-yellow-300"
                : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
            }`}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <FontAwesomeIcon icon={faSun} className="h-5 w-5" />
            ) : (
              <FontAwesomeIcon icon={faMoon} className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("userRole");
              localStorage.removeItem("userData");
              handleNavigation("/");
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              darkMode
                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                : "bg-red-50 text-red-600 hover:bg-red-100"
            }`}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden mt-4 py-3 px-2 rounded-lg shadow-lg ${
            darkMode ? "bg-gray-700" : "bg-white"
          }`}
        >
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
                Welcome {user?.fullName || "User"}
              </span>
              <button
                onClick={() => handleNavigation("/user/profile")}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${
                  darkMode ? "bg-purple-600" : "bg-purple-700"
                }`}
              >
                {user?.fullName ? user.fullName[0].toUpperCase() : <FontAwesomeIcon icon={faUser} />}
              </button>
            </div>
            
            {/* Events Section - Only show for T&S students */}
            {isTnSStudent && (
              <div>
                <div className="font-semibold mb-1 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  Events
                </div>
                <button
                  onClick={() => handleNavigation("/user/events")}
                  className={`w-full py-2 text-left rounded ${darkMode ? "bg-gray-600 text-white" : "bg-gray-100 text-gray-800"} mb-1`}
                >
                  Browse Events
                </button>
                <button
                  onClick={() => handleNavigation("/user/registration")}
                  className={`w-full py-2 text-left rounded ${darkMode ? "bg-gray-600 text-white" : "bg-gray-100 text-gray-800"}`}
                >
                  My Registrations
                </button>
              </div>
            )}
            
            {/* Interviews Section - Always visible */}
            <div>
              <div className={`font-semibold mb-1 flex items-center gap-2 ${isTnSStudent ? 'mt-3' : ''}`}>
                <FontAwesomeIcon icon={faComments} />
                Mock Interviews
              </div>
              <button
                onClick={() => handleNavigation("/user/panel-registration")}
                className={`w-full py-2 text-left rounded ${darkMode ? "bg-gray-600 text-white" : "bg-gray-100 text-gray-800"} mb-1`}
              >
                Register for Mock Interview Panel
              </button>
              <button
                onClick={() => handleNavigation("/user/interview-schedule")}
                className={`w-full py-2 text-left rounded ${darkMode ? "bg-gray-600 text-white" : "bg-gray-100 text-gray-800"}`}
              >
                My Mock Interview Schedule
              </button>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`w-full py-2 text-center rounded flex items-center justify-center space-x-2 ${darkMode ? "bg-gray-600 text-white" : "bg-gray-100 text-gray-800"}`}
            >
              {darkMode ? (
                <>
                  <FontAwesomeIcon icon={faSun} className="h-4 w-4" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faMoon} className="h-4 w-4" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("userRole");
                localStorage.removeItem("userData");
                handleNavigation("/");
              }}
              className={`w-full py-2 text-center rounded-lg font-medium ${
                darkMode ? "bg-red-500/20 text-red-400" : "bg-red-50 text-red-600"
              }`}
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
