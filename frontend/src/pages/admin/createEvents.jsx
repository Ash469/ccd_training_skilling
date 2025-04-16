import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';

export default function CreateEvent({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      const formData = {
        eventName: e.target.elements.eventName.value,
        speaker: e.target.elements.speaker.value,
        description: e.target.elements.description.value,
        date: e.target.elements.date.value,
        time: e.target.elements.time.value,
        venue: e.target.elements.venue.value,
        maxSeats: parseInt(e.target.elements.maxSeats.value),
        sendEmail: sendEmail
      };
  
      const response = await fetch(`${API_BASE_URL}/api/events/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Error creating event');
      }
  
      // Show simple alert
      alert('Event created successfully!');
      
      // Navigate to admin dashboard
      navigate('/admin/dashboard');
  
    } catch (error) {
      // Show error in alert
      alert('Error: ' + error.message);
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* Navigation Bar */}
      <nav className={`shadow-sm p-4 transition-colors duration-200 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className={`text-xl font-semibold ${
            darkMode ? 'text-purple-400' : 'text-purple-600'
          }`}>
            Create Event
          </h1>
          <div className="flex items-center gap-4">
            <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
              Welcome, Admin
            </span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${
              darkMode ? 'bg-purple-600' : 'bg-purple-700'
            }`}>
              A
            </div>
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Create New Event
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Details Section */}
          <div className={`p-6 rounded-lg ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-purple-100'
          } border shadow-sm`}>
            <h2 className={`text-lg font-medium mb-4 ${
              darkMode ? 'text-purple-400' : 'text-purple-600'
            }`}>
              Event Details
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Event Name
                </label>
                <input
                  type="text"
                  name="eventName"
                  required
                  className={`w-full p-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="Enter event name"
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Speaker
                </label>
                <input
                  type="text"
                  name="speaker"
                  required
                  className={`w-full p-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="Enter speaker name"
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <label className={`block text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Description
              </label>
              <textarea
                name="description"
                required
                rows="4"
                className={`w-full p-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                placeholder="Enter event description"
              />
            </div>
          </div>

          {/* Date & Location Section */}
          <div className={`p-6 rounded-lg ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-purple-100'
          } border shadow-sm`}>
            <h2 className={`text-lg font-medium mb-4 ${
              darkMode ? 'text-purple-400' : 'text-purple-600'
            }`}>
              Date & Location
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  className={`w-full p-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  required
                  className={`w-full p-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Venue
                </label>
                <input
                  type="text"
                  name="venue"
                  required
                  className={`w-full p-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="Enter venue"
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Maximum Seats
                </label>
                <input
                  type="number"
                  name="maxSeats"
                  min="1"
                  required
                  className={`w-full p-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="Enter maximum seats"
                />
              </div>
            </div>
          </div>

          {/* Email Notification Section */}
          <div className={`p-6 rounded-lg ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-purple-100'
          } border shadow-sm`}>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <label className={`font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Send email notification to all users
              </label>
            </div>
            <p className={`text-sm mt-2 ml-7 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              All registered users will receive an email notification about this new event
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className={`px-4 py-2 rounded-lg font-medium ${
                darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium shadow-sm hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}