import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard({ darkMode, toggleDarkMode }) { // Add props
  const navigate = useNavigate();

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
      registeredUsers: 18,
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
        registeredUsers: 55,
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
        registeredUsers: 30,
        status: "upcoming",
      },
    // ... other events data
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
                    Admin Dashboard
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
                    >
                        {darkMode ? (
                            <svg className="h-5 w-5 transform hover:rotate-45 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5 transform hover:-rotate-12 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
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

        <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                    Manage Events
                </h2>
                <button className={`px-4 py-2 bg-purple-600 text-white rounded-lg font-medium shadow-sm hover:shadow-purple-200/20 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group`}>
                    <span>Create New Event</span>
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>

            <div className="grid gap-6">
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
                            <div className="flex items-center justify-between mb-4">
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
                                <div className="flex gap-2">
                                    <button className={`p-2 rounded-full transition-colors duration-200 ${
                                        darkMode 
                                            ? 'text-gray-400 hover:text-purple-400 hover:bg-gray-700' 
                                            : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                                    }`}>
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button className={`p-2 rounded-full transition-colors duration-200 ${
                                        darkMode 
                                            ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                                            : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                    }`}>
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m4-7.5V4a1 1 0 00-1-1H7a1 1 0 00-1 1v3.5" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <h2 className={`text-xl font-semibold mb-2 ${
                                darkMode ? 'text-white' : 'text-gray-900'
                            }`}>{event.name}</h2>
                            <p className={`mb-4 ${
                                darkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>{event.description}</p>

                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-3">
                                    <div className={`flex items-center ${
                                        darkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {new Date(event.date).toLocaleDateString()}
                                    </div>
                                    <div className={`flex items-center ${
                                        darkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {event.time}
                                    </div>
                                    <div className={`flex items-center ${
                                        darkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        {event.speaker}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className={`flex items-center ${
                                        darkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {event.venue}
                                    </div>
                                    <div className={`flex items-center ${
                                        darkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}>
                                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        <div className="flex items-center flex-1 min-w-0">
                                            <div className={`w-full rounded-full h-2 mr-2 ${
                                                darkMode ? 'bg-gray-700' : 'bg-gray-200'
                                            }`}>
                                                <div className={`h-2 rounded-full ${
                                                    darkMode ? 'bg-purple-400' : 'bg-blue-600'
                                                }`} 
                                                    style={{ width: `${(event.registeredUsers / event.maxSeats) * 100}%` }}>
                                                </div>
                                            </div>
                                            <span className="whitespace-nowrap flex-shrink-0">{event.registeredUsers} / {event.maxSeats}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`px-6 py-4 flex justify-between ${
                            darkMode 
                                ? 'bg-gradient-to-br from-gray-800/50 to-gray-800 border-t border-gray-700' 
                                : 'bg-gradient-to-br from-white to-purple-50 border-t border-gray-100'
                        }`}>
                            <button className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                darkMode
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                            }`}>
                                View Registrations
                            </button>
                            <button className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                darkMode
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                            }`}>
                                Send Update
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
}