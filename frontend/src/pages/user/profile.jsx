import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, Mail, IdCard, UserCircle, Sun, Moon } from 'lucide-react';
import axios from 'axios';

export default function Profile({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserProfile(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch user profile');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [API_BASE_URL]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <p className="text-red-500 mb-2">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-purple-600 hover:text-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'
    }`}>
      {/* Add Navigation Bar */}
      <nav className={`shadow-sm p-4 transition-colors duration-200 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className={`text-xl font-semibold ${
            darkMode ? 'text-purple-400' : 'text-purple-600'
          }`}>
            User Profile
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/user/dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                darkMode 
                  ? 'bg-purple-400/10 text-purple-400 hover:bg-purple-400/20' 
                  : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
              }`}
            >
              Back to Dashboard
            </button>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-all duration-200 ${
                darkMode 
                  ? 'hover:bg-gray-700 text-yellow-400 hover:text-yellow-300' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <Sun className="h-5 w-5 transform hover:rotate-45 transition-transform duration-200" />
              ) : (
                <Moon className="h-5 w-5 transform hover:-rotate-12 transition-transform duration-200" />
              )}
            </button>
            <button
              onClick={() => navigate('/')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                darkMode 
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Existing Profile Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className={`rounded-2xl overflow-hidden shadow-lg ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Profile Header */}
          <div className={`relative h-48 ${
            darkMode ? 'bg-gradient-to-r from-purple-900 to-purple-600' : 'bg-gradient-to-r from-purple-600 to-purple-400'
          }`}>
            <div className="absolute -bottom-16 left-6">
              <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center text-4xl font-bold ${
                darkMode ? 'bg-gray-800 border-gray-800' : 'bg-white border-white'
              }`}>
                {userProfile.fullName.charAt(0)}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-20 p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold">{userProfile.fullName}</h1>
              </div>
              <div className="flex gap-4">
                <button className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  darkMode 
                    ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20' 
                    : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                }`}>
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className={`p-6 rounded-xl ${
                darkMode ? 'bg-gray-700/50' : 'bg-purple-50'
              }`}>
                <p className={`text-sm font-medium ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Registered Events</p>
                <p className={`text-2xl font-bold mt-1 ${
                  darkMode ? 'text-purple-400' : 'text-purple-600'
                }`}>{userProfile.registeredEvents}</p>
              </div>
              <div className={`p-6 rounded-xl ${
                darkMode ? 'bg-gray-700/50' : 'bg-purple-50'
              }`}>
                <p className={`text-sm font-medium ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Upcoming Events</p>
                <p className={`text-2xl font-bold mt-1 ${
                  darkMode ? 'text-purple-400' : 'text-purple-600'
                }`}>{userProfile.upcomingEvents}</p>
              </div>
              <div className={`p-6 rounded-xl ${
                darkMode ? 'bg-gray-700/50' : 'bg-purple-50'
              }`}>
                <p className={`text-sm font-medium ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Completed Events</p>
                <p className={`text-2xl font-bold mt-1 ${
                  darkMode ? 'text-purple-400' : 'text-purple-600'
                }`}>{userProfile.completedEvents}</p>
              </div>
            </div>

            {/* Profile Details */}
            <div className={`mt-8 p-6 rounded-xl space-y-4 ${
              darkMode ? 'bg-gray-700/50' : 'bg-purple-50'
            }`}>
              <h2 className="text-lg font-semibold mb-4">Profile Details</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className={
                    darkMode ? 'text-purple-400' : 'text-purple-500'
                  } />
                  <div>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Email Address</p>
                    <p className="font-medium">{userProfile.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <IdCard className={
                    darkMode ? 'text-purple-400' : 'text-purple-500'
                  } />
                  <div>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Student ID</p>
                    <p className="font-medium">{userProfile.studentId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CalendarCheck className={
                    darkMode ? 'text-purple-400' : 'text-purple-500'
                  } />
                  <div>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Joined Date</p>
                    <p className="font-medium">
                      {new Date(userProfile.joinedDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}