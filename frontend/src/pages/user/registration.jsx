import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, User, Clock, Users, Moon, Sun, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function Registration({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelStatus, setCancelStatus] = useState({ show: false, message: '', type: '' });
  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    fetchUserEvents();
  }, []);

  const fetchUserEvents = async () => {
    try {
      const token = localStorage.getItem('token'); // Assuming you store the token in localStorage
      const response = await axios.get(`${API_BASE_URL}/api/events/user/registered`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setRegisteredEvents(response.data);
      setLoading(false);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setError('Failed to fetch registered events');
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/events/${eventId}/register`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Remove the event from the list immediately
      setRegisteredEvents(prev => prev.filter(event => event._id !== eventId));
      
      // Show success message
      setCancelStatus({
        show: true,
        message: 'Successfully cancelled registration',
        type: 'success'
      });
    } catch (err) {
      setCancelStatus({
        show: true,
        message: `Failed to cancel registration: ${err.response?.data?.message || err.message}`,
        type: 'error'
      });
    }

    // Hide the status message after 3 seconds
    setTimeout(() => {
      setCancelStatus({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );

  if (error) return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className="text-red-500">{error}</div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'
    }`}>
      <nav className={`shadow-sm p-4 transition-colors duration-200 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className={`text-xl font-semibold ${
            darkMode ? 'text-purple-400' : 'text-purple-600'
          }`}>
            My Registrations
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNavigation('/user/dashboard')}
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
            >
              {darkMode ? (
                <Sun className="h-5 w-5 transform hover:rotate-45 transition-transform duration-200" />
              ) : (
                <Moon className="h-5 w-5 transform hover:-rotate-12 transition-transform duration-200" />
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid gap-6">
          {registeredEvents.length === 0 ? (
            <div className={`text-center p-8 rounded-lg ${
              darkMode 
                ? 'bg-gray-800 text-gray-300' 
                : 'bg-white text-gray-600'
            }`}>
              <Users className="w-16 h-16 mx-auto mb-4 text-purple-500 opacity-50" />
              <h3 className={`text-xl font-medium mb-2 ${
                darkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                No Events Registered
              </h3>
              <p className="mb-4">You haven't registered for any events yet.</p>
              <button
                onClick={() => handleNavigation('/user/dashboard')}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  darkMode 
                    ? 'bg-purple-400/10 text-purple-400 hover:bg-purple-400/20' 
                    : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                }`}
              >
                Browse Available Events
              </button>
            </div>
          ) : (
            registeredEvents.map((event) => (
              <div key={event._id} className={`group rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
                darkMode 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-white border border-purple-100'
              }`}>
                <div className={`p-6 ${
                  darkMode 
                    ? 'bg-gradient-to-br from-gray-800 to-gray-800/50' 
                    : 'bg-gradient-to-br from-purple-50/50 via-white to-white'
                }`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-5 w-5 ${
                        event.status === 'upcoming' 
                          ? 'text-green-500' 
                          : event.status === 'completed' 
                            ? 'text-blue-500' 
                            : 'text-yellow-500'
                      }`} />
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        event.status === 'upcoming'
                          ? darkMode 
                            ? 'bg-green-400/10 text-green-400' 
                            : 'bg-green-100 text-green-700'
                          : event.status === 'completed'
                            ? darkMode
                              ? 'bg-blue-400/10 text-blue-400'
                              : 'bg-blue-100 text-blue-700'
                            : darkMode
                              ? 'bg-yellow-400/10 text-yellow-400'
                              : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Registered on: {new Date(event.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className={`mt-4 text-xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {event.eventName}
                  </h3>
                  <p className={`mt-2 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {event.description}
                  </p>

                  <div className={`mt-6 space-y-3 pt-4 ${
                    darkMode ? 'border-t border-gray-700' : 'border-t border-gray-100'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="space-y-3">
                        <div className={`flex items-center ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          <CalendarDays className="h-5 w-5 mr-3 text-purple-500" />
                          <span className="font-medium">
                            {new Date(event.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric"
                            })}
                          </span>
                        </div>
                        <div className={`flex items-center ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          <Clock className="h-5 w-5 mr-3 text-purple-500" />
                          <span className="font-medium">{event.time}</span>
                        </div>
                        <div className={`flex items-center ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          <User className="h-5 w-5 mr-3 text-purple-500" />
                          <span className="font-medium">{event.speaker}</span>
                        </div>
                        <div className={`flex items-center ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          <MapPin className="h-5 w-5 mr-3 text-purple-500" />
                          <span className="font-medium">{event.venue}</span>
                        </div>
                      </div>

                      {event.status === 'upcoming' && (
                        <button
                          onClick={() => handleCancelRegistration(event._id)}
                          className={`px-4 py-2 h-fit rounded-lg font-medium transition-all duration-200 ${
                            darkMode
                              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                              : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                        >
                          Cancel Registration
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      {cancelStatus.show && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          cancelStatus.type === 'success' 
            ? darkMode ? 'bg-green-500/90' : 'bg-green-500' 
            : darkMode ? 'bg-red-500/90' : 'bg-red-500'
        } text-white`}>
          {cancelStatus.message}
        </div>
      )}
    </div>
  );
}