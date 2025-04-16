import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, User, Clock, Users, Moon, Sun } from 'lucide-react';
import axios from 'axios';

export default function UserDashboard({ darkMode, toggleDarkMode }) {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [, setUserRegisteredEventIds] = useState([]);

    const API_BASE_URL = 'http://localhost:5000';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };
                const [eventsResponse, userResponse] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/events/upcoming`),
                    axios.get(`${API_BASE_URL}/api/events/user/registered`, config)
                ]);

                const registeredEventIds = userResponse.data.map(event => event._id);
                setUserRegisteredEventIds(registeredEventIds);

                const eventsWithRegistration = eventsResponse.data.data.map(event => ({
                    ...event,
                    isRegistered: registeredEventIds.includes(event._id)  // Fix: Use _id instead of id
                }));

                setEvents(eventsWithRegistration);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch events');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleRegister = async (eventId) => {
        try {
            // Immediately update UI state
            setEvents(events.map(event => 
                event.id === eventId
                    ? { 
                        ...event, 
                        seatsAvailable: event.seatsAvailable - 1,
                        isRegistered: true 
                      }
                    : event
            ));

            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            await axios.post(
                `${API_BASE_URL}/api/events/${eventId}/register`,
                {},
                config
            );

            setNotification({
                show: true,
                message: 'Successfully registered for the event!',
                type: 'success'
            });
        } catch (err) {
            // Revert UI state if registration fails
            setEvents(events.map(event => 
                event.id === eventId
                    ? { 
                        ...event, 
                        seatsAvailable: event.seatsAvailable + 1,
                        isRegistered: false 
                      }
                    : event
            ));

            setNotification({
                show: true,
                message: err.response?.data?.message || 'Failed to register for event',
                type: 'error'
            });
        }

        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

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
                            Welcome John Doe
                        </span>
                        <button
                            onClick={() => handleNavigation('/user/profile')}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium transition-transform hover:scale-110 ${
                                darkMode ? 'bg-purple-600 hover:bg-purple-500' : 'bg-purple-700 hover:bg-purple-600'
                            }`}
                            aria-label="View Profile"
                        >
                            J
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
                    <button 
                    onClick={() => handleNavigation('/user/registration')}
                    className={`px-4 py-2 border rounded-md transition-colors duration-200 ${
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
                                <button 
                                    onClick={() => handleRegister(event.id)}
                                    disabled={event.seatsAvailable === 0 || event.isRegistered}
                                    className={`w-full py-3 px-4 rounded-lg font-medium shadow-sm transition-all duration-300 flex items-center justify-center gap-2 group
                                        ${event.isRegistered
                                            ? darkMode
                                                ? 'bg-green-500/20 text-green-400 cursor-default'
                                                : 'bg-green-50 text-green-600 cursor-default border border-green-200'
                                            : event.seatsAvailable === 0 
                                                ? darkMode
                                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                : darkMode
                                                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                                    : 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-purple-200/20 hover:shadow-lg'
                                        }`}
                                >
                                    <span className="flex items-center gap-2">
                                        {event.isRegistered && (
                                            <svg 
                                                className="w-5 h-5" 
                                                fill="none" 
                                                viewBox="0 0 24 24" 
                                                stroke="currentColor"
                                            >
                                                <path 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round" 
                                                    strokeWidth={2} 
                                                    d="M5 13l4 4L19 7" 
                                                />
                                            </svg>
                                        )}
                                        {event.isRegistered 
                                            ? 'Registered' 
                                            : event.seatsAvailable === 0 
                                                ? 'Event Full' 
                                                : 'Register Now'
                                        }
                                    </span>
                                    {!event.isRegistered && event.seatsAvailable > 0 && (
                                        <svg 
                                            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
                                            fill="none" 
                                            viewBox="0 0 24 24" 
                                            stroke="currentColor"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M9 5l7 7-7 7" 
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {notification.show && (
                <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg transition-all duration-300 ${
                    notification.type === 'success' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                }`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
}