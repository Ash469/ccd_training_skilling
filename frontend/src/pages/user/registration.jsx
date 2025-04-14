import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, User, Clock, Users, Moon, Sun, CheckCircle } from 'lucide-react';

export default function Registration({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Update the mock data to include all details
  const registeredEvents = [
    {
      id: 1,
      name: "Web Development Workshop",
      description: "Learn the fundamentals of web development with HTML, CSS, and JavaScript.",
      date: "2025-04-20",
      time: "10:00 AM - 12:00 PM",
      speaker: "Prof. Jane Smith",
      venue: "Computer Lab 101",
      maxSeats: 30,
      registrationDate: "2025-04-01",
      status: "confirmed",
    },
    {
      id: 2,
      name: "AI and Machine Learning Seminar",
      description: "Explore the latest trends in artificial intelligence and machine learning.",
      date: "2025-04-25",
      time: "2:00 PM - 4:00 PM",
      speaker: "Dr. John Davis",
      venue: "Auditorium",
      maxSeats: 100,
      registrationDate: "2025-04-05",
      status: "cancelled",
    },
    {
      id: 3,
      name: "Career Guidance Session",
      description: "Get insights on career opportunities in the tech industry.",
      date: "2025-05-05",
      time: "11:00 AM - 1:00 PM",
      speaker: "Ms. Sarah Johnson",
      venue: "Seminar Hall",
      maxSeats: 50,
      registrationDate: "2025-04-10",
      status: "completed",
    }
  ];

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
          {registeredEvents.map((event) => (
            <div key={event.id} className={`group rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
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
                      event.status === 'confirmed' 
                        ? 'text-green-500' 
                        : event.status === 'cancelled' 
                          ? 'text-red-500' 
                          : 'text-blue-500'
                    }`} />
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      event.status === 'confirmed'
                        ? darkMode 
                          ? 'bg-green-400/10 text-green-400 border border-green-400/20' 
                          : 'bg-green-100 text-green-700 border border-green-200'
                        : event.status === 'cancelled'
                          ? darkMode
                            ? 'bg-red-400/10 text-red-400 border border-red-400/20'
                            : 'bg-red-100 text-red-700 border border-red-200'
                          : darkMode
                            ? 'bg-blue-400/10 text-blue-400 border border-blue-400/20'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Registered on: {new Date(event.registrationDate).toLocaleDateString()}
                  </span>
                  
                </div>

                <h3 className={`mt-4 text-xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {event.name}
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
                      {/* Event details with icons */}
                      <div className={`flex items-center ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <CalendarDays className={`h-5 w-5 mr-3 ${
                          darkMode ? 'text-purple-400' : 'text-purple-500'
                        }`} />
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
                        <Clock className={`h-5 w-5 mr-3 ${
                          darkMode ? 'text-purple-400' : 'text-purple-500'
                        }`} />
                        <span className="font-medium">{event.time}</span>
                      </div>
                      <div className={`flex items-center ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <User className={`h-5 w-5 mr-3 ${
                          darkMode ? 'text-purple-400' : 'text-purple-500'
                        }`} />
                        <span className="font-medium">{event.speaker}</span>
                      </div>
                      <div className={`flex items-center ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <MapPin className={`h-5 w-5 mr-3 ${
                          darkMode ? 'text-purple-400' : 'text-purple-500'
                        }`} />
                        <span className="font-medium">{event.venue}</span>
                      </div>
                    </div>

                    {/* Cancel button on the right */}
                    {event.status === 'confirmed' && (
                      <button className={`px-4 py-2 h-fit rounded-lg font-medium transition-all duration-200 ${
                        darkMode
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}>
                        Cancel Registration
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}