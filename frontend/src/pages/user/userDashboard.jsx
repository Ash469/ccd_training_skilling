import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, User, Clock, Users, Moon, Sun, Menu, X, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import Footer from '../../components/footer';

export default function UserDashboard({ darkMode, toggleDarkMode }) {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [, setUserRegisteredEventIds] = useState([]);
    const [user, setUser] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showDisclaimer, setShowDisclaimer] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };
                
                // Get user profile data first to access registered event IDs
                const userProfileResponse = await axios.get(`${API_BASE_URL}/api/users/profile`, config);
                setUser(userProfileResponse.data);
                const registeredEventsResponse = await axios.get(`${API_BASE_URL}/api/events/user/registered`, config);
                // console.log('Registered events response:', registeredEventsResponse.data);
                
                // Extract event IDs from the registered events
                const registeredEventIds = registeredEventsResponse.data.map(event => event._id);
                // console.log('Extracted registered event IDs:', registeredEventIds);
                
                setUserRegisteredEventIds(registeredEventIds);
                
                // Get upcoming events
                const eventsResponse = await axios.get(`${API_BASE_URL}/api/events/upcoming`);
                // console.log('Upcoming events:', eventsResponse.data.data);
                
                // Map the events and check if they're in user's registered events
                const eventsWithRegistration = eventsResponse.data.data.map(event => {
                    const eventId = event._id || event.id;
                    
                    const isRegistered = registeredEventIds.some(registeredId => {
                        // Convert to string if needed for comparison
                        const normalizedRegisteredId = typeof registeredId === 'object' 
                            ? (registeredId.$oid || registeredId._id) 
                            : String(registeredId);
                        
                        const normalizedEventId = String(eventId);
                        const matched = normalizedRegisteredId === normalizedEventId;
                        
                        if (matched) {
                            console.log(`Match found! Event ${eventId} is registered`);
                        }
                        
                        return matched;
                    });
                    
                    console.log(`Event ${eventId} (${event.name}) registration status:`, isRegistered);
                    
                    return {
                        ...event,
                        isRegistered
                    };
                });

                setEvents(eventsWithRegistration);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.response?.data?.message || 'Failed to fetch events');
                setLoading(false);
            }
        };

        fetchData();
    }, [API_BASE_URL]);

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleRegisterClick = (eventId) => {
        setSelectedEventId(eventId);
        setShowDisclaimer(true);
        setIsConfirmed(false); // Reset confirmation state when opening modal
    };

    const handleConfirmRegistration = async () => {
        setShowDisclaimer(false);
        if (selectedEventId) {
            await handleRegister(selectedEventId);
            setSelectedEventId(null);
        }
    };

    const handleRegister = async (eventId) => {
        try {
            const targetEvent = events.find(event => event.id === eventId || event._id === eventId);
            const targetEventId = targetEvent?.id || targetEvent?._id || eventId;
            
            setEvents(events.map(event => 
                event.id === targetEventId || event._id === targetEventId
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
                `${API_BASE_URL}/api/events/${targetEventId}/register`,
                {},
                config
            );
            setUserRegisteredEventIds(prev => [...prev, targetEventId]);
            
            setNotification({
                show: true,
                message: 'Successfully registered for the event!',
                type: 'success'
            });
        } catch (err) {
            console.error('Registration error:', err);
            const targetEvent = events.find(event => event.id === eventId || event._id === eventId);
            const targetEventId = targetEvent?.id || targetEvent?._id || eventId;
            
            setEvents(events.map(event => 
                event.id === targetEventId || event._id === targetEventId
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

    // Fix the formatEventDateRange function
    const formatEventDateRange = (event) => {
        const startDate = event.startDate || event.date;
        const endDate = event.endDate;
        
        const formatDate = (date) => {
            return new Date(date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            });
        };
        
        // Fix the condition to correctly check if dates are different
        if (endDate && new Date(startDate).toDateString() !== new Date(endDate).toDateString()) {
            return `${formatDate(startDate)} - ${formatDate(endDate)}`;
        }
        
        return formatDate(startDate);
    };

    const formatEventTimeRange = (event) => {
        const startTime = event.startTime || event.time;
        const endTime = event.endTime;
        
        if (endTime) {
            return `${startTime} - ${endTime}`;
        }
        
        return startTime;
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

  //   if (events.length === 0) {
  //   return (
  //     <div className={`min-h-screen flex items-center justify-center ${
  //       darkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-700'
  //     }`}>
  //       <p className="text-lg font-medium text-center px-4">
  //         No events, once there is an event it will show here.
  //       </p>
  //     </div>
  //   );
  // }

    return (
        <div className={`min-h-screen transition-colors duration-200 ${
            darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'
        }`}>
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
                            Training and Skilling Portal
                        </h1>
                    </div>
                    
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
                    
                    <div className="hidden md:flex items-center gap-4">
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                            Welcome {user?.fullName || 'User'}
                        </span>
                        <button
                            onClick={() => handleNavigation('/user/profile')}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium transition-transform hover:scale-110 ${
                                darkMode ? 'bg-purple-600 hover:bg-purple-500' : 'bg-purple-700 hover:bg-purple-600'
                            }`}
                            aria-label="View Profile"
                        >
                            {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
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
                            onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('userRole');
                                localStorage.removeItem('userData');
                                handleNavigation('/');
                            }}
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
                
                {mobileMenuOpen && (
                    <div className={`md:hidden mt-4 py-3 px-2 rounded-lg shadow-lg ${
                        darkMode ? 'bg-gray-700' : 'bg-white'
                    }`}>
                        <div className="flex flex-col space-y-3">
                            <div className="flex items-center justify-between px-2">
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                    Welcome {user?.fullName || 'User'}
                                </span>
                                <button
                                    onClick={() => handleNavigation('/user/profile')}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${
                                        darkMode ? 'bg-purple-600' : 'bg-purple-700'
                                    }`}
                                >
                                    {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
                                </button>
                            </div>
                            
                            <div className="border-t border-b py-2 my-1 grid grid-cols-2 gap-2 px-2">
                                <button
                                    onClick={() => handleNavigation('/user/registration')}
                                    className={`w-full py-2 text-center rounded ${
                                        darkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    My Registrations
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
                                            <span>Light</span>
                                        </>
                                    ) : (
                                        <>
                                            <Moon className="h-4 w-4" />
                                            <span>Dark</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            <button
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('userRole');
                                    localStorage.removeItem('userData');
                                    handleNavigation('/');
                                }}
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

                {
                events.length === 0 ? (
  <div className={`min-h-[200px] flex items-center justify-center ${
    darkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-700'
  } rounded-md p-6`}>
    <p className="text-lg font-medium text-center px-4">
      No events, once there is an event it will show here.
    </p>
  </div>
) : (

                

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                        <div key={event._id || event.id} className={`group rounded-lg shadow-md hover:shadow-xl overflow-hidden transition-all duration-300 ${
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
                                
                                {/* Display promotion link if available */}
                                {event.promotionLink && (
                                    <div className={`mt-3 mb-2`}>
                                        <a
                                            href={event.promotionLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`inline-flex items-center text-sm font-medium ${
                                                darkMode 
                                                    ? 'text-blue-400 hover:text-blue-300' 
                                                    : 'text-blue-600 hover:text-blue-800'
                                            }`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                            View more details
                                        </a>
                                    </div>
                                )}

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
                                            {formatEventDateRange(event)}
                                        </span>
                                    </div>
                                    <div className={`flex items-center ${
                                        darkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        <Clock className={`h-5 w-5 mr-3 ${
                                            darkMode ? 'text-purple-400' : 'text-purple-500'
                                        }`} />
                                        <span className="font-medium">{formatEventTimeRange(event)}</span>
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
                                    onClick={() => event.seatsAvailable > 0 && !event.isRegistered ? 
                                        handleRegisterClick(event._id || event.id) : 
                                        null}
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
                                                ? 'Registration closed' 
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
                </div> ) }
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

            {/* Disclaimer Modal */}
            {showDisclaimer && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
                    <div className={`max-w-md w-full p-6 rounded-xl shadow-xl ${
                        darkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        <div className="flex items-center mb-4 text-amber-500">
                            <AlertTriangle className="h-6 w-6 mr-2" />
                            <h3 className="text-lg font-bold">Disclaimer</h3>
                        </div>
                        
                        <div className={`p-4 rounded-lg mb-4 ${
                            darkMode ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50'
                        }`}>
                            <p className={`mb-3 font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                <em>Disclaimer:</em>
                            </p>
                            <ul className={`list-disc space-y-2 pl-5 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                <li>You are about to register for this CCD event.</li>
                                <li><em>Seats are limited</em>, so please register only if you are sure you will attend.</li>
                                <li>We <em>analyze attendance data regularly</em>. If someone is found absent from multiple events after registering, <strong>CCD may restrict their participation in future events</strong>.</li>
                                <li>Once registered, <em>you cannot cancel your registration</em> unless CCD provides an official window for deregistration.</li>
                                <li>Please be considerate — register only if you are certain about attending, so that <em>others also get a fair chance</em> to participate.</li>
                            </ul>
                            
                            <div className="mt-5 flex items-start border-t pt-4 border-amber-200/30">
                                <p className={`font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    <em>Please check the box below:</em>
                                </p>
                            </div>
                            
                            <div className="mt-2 flex items-start">
                                <input 
                                    type="checkbox" 
                                    id="confirmRegistration" 
                                    checked={isConfirmed}
                                    onChange={() => setIsConfirmed(!isConfirmed)}
                                    className={`mt-1 h-4 w-4 rounded border-gray-300 ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                                />
                                <label 
                                    htmlFor="confirmRegistration" 
                                    className={`ml-2 text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}
                                >
                                    "I have read this carefully and I confirm my registration for this event."
                                </label>
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                            <button 
                                onClick={() => {
                                    setShowDisclaimer(false);
                                    setSelectedEventId(null);
                                }}
                                className={`px-4 py-2 rounded-lg ${
                                    darkMode 
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmRegistration}
                                disabled={!isConfirmed}
                                className={`px-4 py-2 rounded-lg font-medium ${
                                    isConfirmed 
                                        ? darkMode 
                                            ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                                        : darkMode 
                                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                Register
                            </button>
                        </div>
                    </div>
                    
                </div>
            )}

        <Footer darkMode={darkMode} />

        </div>
    );
}
