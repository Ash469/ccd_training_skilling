import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, User, Clock, Users, Moon, Sun } from 'lucide-react';

export default function UserDashboard({ darkMode, toggleDarkMode }) { // Add props
   const navigate = useNavigate();

  const handleNavigation = (path) => {
    // Use the navigate function from useNavigate
    navigate(path);
  };

  // Mock events data
  const events = [
    {
      id: 1,
      name: "Web Development Workshop",
      description: "Learn the fundamentals of web development with HTML, CSS, and JavaScript.",
      date: "2025-04-20",
      time: "10:00 AM - 12:00 PM",
      speaker: "Prof. Jane Smith",
      venue: "Computer Lab 101",
      maxSeats: 30,
      seatsAvailable: 12,
      status: "upcoming",
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
        seatsAvailable: 45,
        status: "upcoming",
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
        seatsAvailable: 20,
        status: "upcoming",
      },
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
                    Training and Skilling
                </h1>
                <div className="flex items-center gap-4">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        Welcome, John Doe
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${
                        darkMode ? 'bg-purple-600' : 'bg-purple-700'
                    }`}>
                        J
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
                        onClick={() => handleNavigation('/')}
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

        <main className="max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                    Upcoming Events
                </h2>
                <button className={`px-4 py-2 border rounded-md transition-colors duration-200 ${
                    darkMode 
                        ? 'border-purple-400 text-purple-400 hover:bg-purple-400/10' 
                        : 'border-purple-600 text-purple-600 hover:bg-purple-50'
                }`}>
                    My Registrations
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                    <div key={event.id} className={`group rounded-lg shadow-md hover:shadow-xl overflow-hidden transition-all duration-300 ${
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
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        darkMode 
                                            ? 'bg-purple-400/10 text-purple-400 border border-purple-400/20' 
                                            : 'bg-purple-100 text-purple-700 border border-purple-200'
                                    }`}>
                                        {event.status === "upcoming" ? "Upcoming" : "Past"}
                                    </span>
                                </div>
                                <span className={`flex items-center gap-1.5 text-sm font-medium ${
                                    darkMode ? 'text-purple-400' : 'text-purple-700'
                                }`}>
                                    <Users className="h-4 w-4" />
                                    {event.seatsAvailable} seats left
                                </span>
                            </div>
                            
                            <h3 className={`mt-4 text-xl font-bold transition-colors ${
                                darkMode 
                                    ? 'text-white group-hover:text-purple-400' 
                                    : 'text-gray-900 group-hover:text-purple-700'
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
                                <div className={`flex items-center ${
                                    darkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <Users className={`h-5 w-5 mr-3 ${
                                        darkMode ? 'text-purple-400' : 'text-purple-500'
                                    }`} />
                                    <span className="font-medium">{event.maxSeats} max seats</span>
                                </div>
                            </div>
                        </div>

                        <div className={`p-4 ${
                            darkMode 
                                ? 'bg-gradient-to-br from-gray-800/50 to-gray-800' 
                                : 'bg-gradient-to-br from-white to-purple-50'
                        }`}>
                            <button className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow-sm hover:shadow-purple-200/20 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group">
                                <span>Register Now</span>
                                <svg 
                                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    </div>
);
}