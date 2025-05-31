import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faEdit,faTrash,faSun,faMoon,faCalendar,faClock,faUser,faLocationDot,faUsers,faPlus,faBars,faTimes} from '@fortawesome/free-solid-svg-icons';
import ErrorFallback from '../../components/ErrorFallback';
import Footer from '../../components/footer';

export default function AdminDashboard({ darkMode, toggleDarkMode }) {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
    const [cancellationSettings, setCancellationSettings] = useState({
        isCancellationAllowed: false
    });
    
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                
                if (!token) {
                    throw new Error('Authentication token not found. Please log in again.');
                }
                
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };   
                
                const response = await axios.get(`${API_BASE_URL}/api/events`, config);
                
                if (!response.data || !response.data.success) {
                    throw new Error('Failed to fetch events: ' + (response.data?.message || 'Unknown error'));
                }
                
                const eventsData = response.data.data || [];
                
                const formattedEvents = eventsData.map(event => ({
                    id: event._id,
                    name: event.eventName || 'Untitled Event',
                    description: event.description || 'No description available',
                    date: event.date || new Date(),
                    time: event.time || '00:00',
                    speaker: event.speaker || 'TBA',
                    venue: event.venue || 'TBA',
                    maxSeats: event.maxSeats || 0,
                    registeredUsers: event.registeredUsers || 0,
                    status: event.status || 'upcoming',
                    promotionLink: event.promotionLink || ''
                }));
                
                setEvents(formattedEvents);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching events:', err);
                setError(err.message || 'Failed to fetch events');
                setLoading(false);
            }
        };

        fetchEvents();
    }, [API_BASE_URL]);

    const handleEdit = (event) => {
        setSelectedEvent(event);
        setNewStatus(event.status);
        setIsUpdateModalOpen(true);
    };

    const handleStatusUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            
            await axios.put(
                `${API_BASE_URL}/api/events/${selectedEvent.id}/status`,
                { status: newStatus },
                config
            );
            
            // Update the events list with the new status
            setEvents(events.map(event => 
                event.id === selectedEvent.id 
                    ? { ...event, status: newStatus }
                    : event
            ));
            
            setIsUpdateModalOpen(false);
            setSelectedEvent(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update event status');
        }
    };

    const handleDelete = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            
            await axios.delete(`${API_BASE_URL}/api/events/${eventId}`, config);

            setEvents(events.filter(event => event.id !== eventId));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete event');
        }
    };

    const handleViewRegistrations = (eventId) => {
        // Navigate to the event registrations page with the event ID
        navigate(`/admin/events/${eventId}/registrations`);
    };

    const handleCancellationSettingsUpdate = async () => {
        try {
            console.log('Updating cancellation policy for event:', selectedEvent.id);
            console.log('New settings:', { isCancellationAllowed: cancellationSettings.isCancellationAllowed });
            
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };
            
            const requestBody = { 
                isCancellationAllowed: cancellationSettings.isCancellationAllowed 
            };
            
            console.log('Request payload:', requestBody);
            
            const response = await axios.put(
                `${API_BASE_URL}/api/events/${selectedEvent.id}/cancellation-policy`,
                requestBody,
                config
            );
            
            console.log('Response:', response.data);
            
            // Update the events list with the new cancellation policy
            setEvents(events.map(event => 
                event.id === selectedEvent.id 
                    ? { 
                        ...event, 
                        isCancellationAllowed: cancellationSettings.isCancellationAllowed
                      }
                    : event
            ));
            
            setIsCancellationModalOpen(false);
            setSelectedEvent(null);
            setCancellationSettings({
                isCancellationAllowed: false
            });
        } catch (err) {
            console.error('Error updating cancellation policy:', err);
            if (err.response) {
                console.error('Error response data:', err.response.data);
                console.error('Error response status:', err.response.status);
            }
            setError(err.response?.data?.message || 'Failed to update cancellation policy');
        }
    };

    const openCancellationModal = (event) => {
        setSelectedEvent(event);
        setCancellationSettings({
            isCancellationAllowed: event.isCancellationAllowed || false
        });
        setIsCancellationModalOpen(true);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center text-red-500">
            {error}
        </div>;
    }

    return (
        <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'
            }`}>
            <nav className={`shadow-sm p-4 transition-colors duration-200 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
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
                            Admin Dashboard
                        </h1>
                    </div>
                    
                    {/* Mobile menu button */}
                    <button 
                        className="md:hidden p-2 rounded-md"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <FontAwesomeIcon 
                                icon={faTimes} 
                                className={darkMode ? 'text-white' : 'text-gray-800'} 
                            />
                        ) : (
                            <FontAwesomeIcon 
                                icon={faBars} 
                                className={darkMode ? 'text-white' : 'text-gray-800'} 
                            />
                        )}
                    </button>
                    
                    {/* Desktop menu */}
                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/student-analytics')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${darkMode
                                    ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
                                    : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                                }`}
                        >
                            Student Analytics
                        </button>
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                            Welcome Admin
                        </span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${darkMode ? 'bg-purple-600' : 'bg-purple-700'
                            }`}>
                            A
                        </div>
                        <button
                            onClick={toggleDarkMode}
                            className={`p-2 rounded-full transition-all duration-200 ${darkMode
                                    ? 'hover:bg-gray-700 text-yellow-400 hover:text-yellow-300'
                                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {darkMode ? (
                                <FontAwesomeIcon 
                                    icon={faSun} 
                                    className="h-5 w-5 transform hover:rotate-45 transition-transform duration-200" 
                                />
                            ) : (
                                <FontAwesomeIcon 
                                    icon={faMoon} 
                                    className="h-5 w-5 transform hover:-rotate-12 transition-transform duration-200" 
                                />
                            )}
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${darkMode
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
                                    Welcome Admin
                                </span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${
                                    darkMode ? 'bg-purple-600' : 'bg-purple-700'
                                }`}>
                                    A
                                </div>
                            </div>
                            
                            <button
                                onClick={() => navigate('/admin/create-event')}
                                className={`w-full py-2 text-center rounded ${
                                    darkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                Create Event
                            </button>
                            
                            <button
                                onClick={() => navigate('/admin/student-analytics')}
                                className={`w-full py-2 text-center rounded ${
                                    darkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                Student Analytics
                            </button>
                            
                            <button
                                onClick={toggleDarkMode}
                                className={`w-full py-2 text-center rounded flex items-center justify-center space-x-2 ${
                                    darkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800'
                                }`}
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

            <div className="max-w-7xl mx-auto p-6 pb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                        Manage Events
                    </h2>
                    <button
                        onClick={() => navigate('/admin/create-event')}
                        className={`px-4 py-2 bg-purple-600 text-white rounded-lg font-medium shadow-sm hover:shadow-purple-200/20 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group`}>
                        <span>Create New Event</span>
                        <FontAwesomeIcon 
                            icon={faPlus} 
                            className="transition-transform duration-300 group-hover:translate-x-1" 
                        />
                    </button>
                </div>

                <div className="grid gap-6">
                    {Array.isArray(events) && events.length > 0 ? (
                        events.map((event) => (
                            <div key={event.id || Math.random()} className={`group rounded-lg shadow-md hover:shadow-xl overflow-hidden transition-all duration-300 ${darkMode
                                    ? 'bg-gray-800 border border-gray-700'
                                    : 'bg-white border border-purple-100'
                                }`}>
                                <div className={`p-6 ${darkMode
                                        ? 'bg-gradient-to-br from-gray-800 to-gray-800/50'
                                        : 'bg-gradient-to-br from-purple-50/50 via-white to-white'
                                    }`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${darkMode
                                                    ? 'bg-purple-400/10 text-purple-400 border border-purple-400/20'
                                                    : 'bg-purple-100 text-purple-700 border border-purple-200'
                                                }`}>
                                                {event.status}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleEdit(event)}
                                                className={`p-2 rounded-full transition-colors duration-200 ${
                                                    darkMode
                                                        ? 'text-gray-400 hover:text-purple-400 hover:bg-gray-700'
                                                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                                                }`}
                                            >
                                                <FontAwesomeIcon icon={faEdit} className="h-5 w-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(event.id)}
                                                className={`p-2 rounded-full transition-colors duration-200 ${
                                                    darkMode
                                                        ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                                                        : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                                }`}
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'
                                        }`}>{event.name}</h2>
                                    <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'
                                        }`}>{event.description}</p>
                                    
                                    {/* Display promotion link if available */}
                                    {event.promotionLink && (
                                        <div className={`mb-4 p-2 rounded-md ${
                                            darkMode ? 'bg-gray-700' : 'bg-purple-50'
                                        }`}>
                                            <p className={`text-sm font-medium mb-1 ${
                                                darkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                                Promotion Link:
                                            </p>
                                            <a 
                                                href={event.promotionLink} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className={`text-sm break-all ${
                                                    darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                                                }`}
                                            >
                                                {event.promotionLink}
                                            </a>
                                        </div>
                                    )}

                                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-3">
                                            <div className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                <FontAwesomeIcon icon={faCalendar} className="w-4 h-4 mr-2" />
                                                {new Date(event.date).toLocaleDateString()}
                                            </div>
                                            <div className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                <FontAwesomeIcon icon={faClock} className="w-4 h-4 mr-2" />
                                                {event.time}
                                            </div>
                                            <div className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                <FontAwesomeIcon icon={faUser} className="w-4 h-4 mr-2" />
                                                {event.speaker}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4 mr-2" />
                                                {event.venue}
                                            </div>
                                            <div className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                <FontAwesomeIcon icon={faUsers} className="w-4 h-4 mr-2 flex-shrink-0" />
                                                <div className="flex items-center flex-1 min-w-0">
                                                    <div className={`w-full rounded-full h-2 mr-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                                        <div className={`h-2 rounded-full ${darkMode ? 'bg-purple-400' : 'bg-blue-600'}`}
                                                            style={{ width: `${(event.registeredUsers / event.maxSeats) * 100}%` }}>
                                                        </div>
                                                    </div>
                                                    <span className="whitespace-nowrap flex-shrink-0">{event.registeredUsers} / {event.maxSeats}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={`px-6 py-4 flex justify-between ${darkMode
                                        ? 'bg-gradient-to-br from-gray-800/50 to-gray-800 border-t border-gray-700'
                                        : 'bg-gradient-to-br from-white to-purple-50 border-t border-gray-100'
                                    }`}>
                                    <button 
                                        onClick={() => handleViewRegistrations(event.id)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                            darkMode
                                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                                        }`}
                                    >
                                        View Registrations
                                    </button>
                                    <button 
                                        onClick={() => openCancellationModal(event)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${darkMode
                                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                                            }`}
                                    >
                                        Cancellation Settings
                                    </button>
                                    <button className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${darkMode
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                                        }`}>
                                        Send Update
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={`text-center p-8 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'
                            }`}>
                            <p className="text-lg">No events available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Status update modal */}
            {isUpdateModalOpen && selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className={`${
                        darkMode ? 'bg-gray-800' : 'bg-white'
                    } rounded-lg p-6 w-96 shadow-xl`}>
                        <h3 className={`text-lg font-semibold mb-4 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                            Update Event Status
                        </h3>
                        <div className="mb-4">
                            <label className={`block mb-2 ${
                                darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Event: {selectedEvent.name}
                            </label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className={`w-full p-2 rounded border ${
                                    darkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white' 
                                        : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            >
                                <option value="upcoming">Upcoming</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsUpdateModalOpen(false)}
                                className={`px-4 py-2 rounded ${
                                    darkMode
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStatusUpdate}
                                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                            >
                                Update Status
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancellation policy modal */}
            {isCancellationModalOpen && selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className={`${
                        darkMode ? 'bg-gray-800' : 'bg-white'
                    } rounded-lg p-6 w-96 shadow-xl`}>
                        <h3 className={`text-lg font-semibold mb-4 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                            Registration Cancellation Settings
                        </h3>
                        <div className="mb-4">
                            <label className={`block mb-2 ${
                                darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Event: {selectedEvent.name}
                            </label>
                            <div className="flex items-center mb-4">
                                <input
                                    type="checkbox"
                                    id="allowCancellation"
                                    checked={cancellationSettings.isCancellationAllowed}
                                    onChange={(e) => setCancellationSettings({
                                        isCancellationAllowed: e.target.checked
                                    })}
                                    className="mr-2"
                                />
                                <label htmlFor="allowCancellation" className={`${
                                    darkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    {cancellationSettings.isCancellationAllowed 
                                        ? "Allow students to cancel their registration" 
                                        : "Don't allow registration cancellation"}
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsCancellationModalOpen(false)}
                                className={`px-4 py-2 rounded ${
                                    darkMode
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCancellationSettingsUpdate}
                                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                            >
                                Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Footer darkMode={darkMode} />
        </div>
    );
}