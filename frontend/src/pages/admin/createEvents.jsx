import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import Footer from '../../components/footer';

export default function CreateEvent({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [promotionLink, setPromotionLink] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Form fields
  const [eventName, setEventName] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [maxSeats, setMaxSeats] = useState('');

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Calculate minimum date for date input (today)
  const today = new Date();
  const minDate = today;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Format date as YYYY-MM-DD
      const formattedDate = selectedDate.toISOString().split('T')[0];

      // Create event data object
      const eventData = {
        eventName,
        speaker,
        description,
        date: formattedDate,
        time,
        venue,
        maxSeats: parseInt(maxSeats, 10),
        sendEmail,
      };

      // Add promotion link if provided
      if (promotionLink) {
        eventData.promotionLink = promotionLink;
      }

      console.log('Submitting event data:', eventData);

      const response = await axios.post(
        `${API_BASE_URL}/api/events/create`, 
        eventData, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('Event creation response:', response.data);
      
      if (response.data && response.data.success) {
        let message = 'Event created successfully!';
        
        // Add information about email notifications if available
        if (response.data.emailNotification) {
          message += ` Email notifications sent to ${response.data.emailNotification.sent} users`;
          if (response.data.emailNotification.failed > 0) {
            message += ` (${response.data.emailNotification.failed} failed)`;
          }
        }
        
        alert(message);
        navigate('/admin/dashboard');
      } else {
        throw new Error(response.data?.message || 'Unknown error occurred');
      }

    } catch (error) {
      console.error('Error creating event:', error);
      console.error('Response data:', error.response?.data);
      alert('Error: ' + (error.response?.data?.message || error.message || 'Failed to create event'));
    } finally {
      setIsLoading(false);
    }
  };

  // Custom date picker styles
  const datePickerWrapperClassName = darkMode 
    ? "bg-gray-700 border-gray-600 text-white rounded-lg shadow-sm" 
    : "bg-white border-gray-300 text-gray-900 rounded-lg shadow-sm";
  
  const datePickerClassName = darkMode
    ? "bg-gray-700 text-white"
    : "bg-white text-gray-900";
  
  // Custom header for the datepicker
  const CustomDatePickerHeader = ({ 
    date,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled
  }) => (
    <div className={`flex items-center justify-between px-2 py-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <button
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        className={`p-1 rounded-full ${
          darkMode 
            ? 'text-gray-300 hover:bg-gray-700 disabled:text-gray-600' 
            : 'text-gray-700 hover:bg-gray-200 disabled:text-gray-400'
        }`}
        type="button"
      >
        ❮
      </button>
      <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </div>
      <button
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        className={`p-1 rounded-full ${
          darkMode 
            ? 'text-gray-300 hover:bg-gray-700 disabled:text-gray-600' 
            : 'text-gray-700 hover:bg-gray-200 disabled:text-gray-400'
        }`}
        type="button"
      >
        ❯
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* Navigation Bar */}
      <nav className={`shadow-sm p-4 transition-colors duration-200 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/logo.png" 
              alt="CCD Logo" 
              className="h-12 w-auto mr-3" 
            />
            <h1 className={`text-xl font-semibold ${
              darkMode ? 'text-purple-400' : 'text-purple-600'
            }`}>
              Create Event
            </h1>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className={darkMode ? 'text-white' : 'text-gray-800'} />
            ) : (
              <Menu className={darkMode ? 'text-white' : 'text-gray-800'} />
            )}
          </button>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-4">
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
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden mt-4 py-3 px-2 rounded-lg shadow-lg ${
            darkMode ? 'bg-gray-700' : 'bg-white'
          }`}>
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  Welcome, Admin
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${
                  darkMode ? 'bg-purple-600' : 'bg-purple-700'
                }`}>
                  A
                </div>
              </div>
              
              <button
                onClick={() => navigate('/admin/dashboard')}
                className={`w-full py-2 text-center rounded ${
                  darkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800'
                }`}
              >
                Admin Dashboard
              </button>
              
              <button
                onClick={toggleDarkMode}
                className={`w-full py-2 text-center rounded flex items-center justify-center space-x-2 ${
                  darkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {darkMode ? (
                  <>
                    <Sun className="h-4 w-4" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => navigate('/')}
                className={`w-full py-2 text-center rounded-lg font-medium ${
                  darkMode 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-red-50 text-red-600'
                }`}
              >
                Logout
              </button>
            </div>
          </div>
        )}
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
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
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
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
            <div className="mt-4 space-y-2">
              <label className={`block text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Promotion Link
              </label>
              <input
                type="url"
                value={promotionLink}
                onChange={(e) => setPromotionLink(e.target.value)}
                className={`w-full p-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                placeholder="https://example.com/event-details"
              />
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Add a link to promotional materials, registration page, or additional details
              </p>
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
                <div className="relative flex items-center">
                  <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    darkMode ? 'text-purple-400' : 'text-purple-600'
                  }`}>
                    <Calendar className="h-5 w-5" />
                  </div>
                  <DatePicker
                    selected={selectedDate}
                    onChange={date => setSelectedDate(date)}
                    minDate={minDate}
                    dateFormat="MMMM d, yyyy"
                    className={`w-full p-2 pl-10 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300'
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    wrapperClassName="w-full"
                    calendarClassName={datePickerClassName}
                    popperClassName={datePickerWrapperClassName}
                    renderCustomHeader={CustomDatePickerHeader}
                    dayClassName={() =>
                      darkMode
                        ? 'text-white hover:bg-purple-700'
                        : 'text-gray-900 hover:bg-purple-100'
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
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
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
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
                  value={maxSeats}
                  onChange={(e) => setMaxSeats(e.target.value)}
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
              onClick={() => navigate('/admin/dashboard')}
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
      <Footer darkMode={darkMode} />

    </div>
  );
}