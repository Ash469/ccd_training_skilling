import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUserGroup, faDownload } from '@fortawesome/free-solid-svg-icons';
import ErrorFallback from '../../components/ErrorFallback';

export default function EventRegistrations({ darkMode }) {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [registrations, setRegistrations] = useState([]);
    const [eventName, setEventName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found. Please login again.');
                }

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    timeout: 10000
                };
                
                const response = await axios.get(
                    `${API_BASE_URL}/api/events/${eventId}/registrations`,
                    config
                );
                
                if (response.data && response.data.success) {
                    setRegistrations(response.data.data || []);
                    setEventName(response.data.eventName || 'Event');
                } else {
                    setRegistrations([]);
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching registrations:', err);
                
                let errorMsg = 'Failed to fetch registrations. Please try again later.';
                
                // Show clearer error for local development
                if (API_BASE_URL.includes('localhost')) {
                    errorMsg = 'Could not connect to local server. Make sure your backend is running on port 5000.';
                }
                
                setError(errorMsg);
                setLoading(false);
            }
        };

        if (eventId) {
            fetchRegistrations();
        }
    }, [eventId, API_BASE_URL]);

    const handleBack = () => {
        navigate('/admin/dashboard');
    };

    const downloadCSV = () => {
        try {
            setDownloading(true);
            
            // Convert registrations data to CSV format
            const headers = ['Name', 'Roll Number', 'Email'];
            const csvRows = [headers];
            
            registrations.forEach(user => {
                csvRows.push([
                    user.fullName || '',
                    user.rollNumber || '',
                    user.email || ''
                ]);
            });
            
            // Convert the rows to CSV string
            const csvContent = csvRows.map(row => 
                row.map(cell => 
                    // Escape quotes and wrap in quotes if needed
                    typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))
                        ? `"${cell.replace(/"/g, '""')}"`
                        : cell
                ).join(',')
            ).join('\n');
            
            // Create a blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `${eventName.replace(/\s+/g, '_')}_Registrations.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setDownloading(false);
        } catch (err) {
            console.error('Error downloading CSV:', err);
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
            <div className="max-w-6xl mx-auto p-6">
                <div className="mb-6">
                    <button 
                        onClick={handleBack}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                            darkMode 
                                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                        } shadow-sm`}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        <span>Back to Dashboard</span>
                    </button>
                </div>

                <div className={`rounded-lg shadow-md overflow-hidden ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <div className={`p-6 border-b ${
                        darkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                        <div className="flex items-center justify-between">
                            <h1 className={`text-2xl font-bold ${
                                darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                                {eventName} - Registrations
                            </h1>
                            <div className="flex items-center gap-3">
                                {registrations.length > 0 && (
                                    <button
                                        onClick={downloadCSV}
                                        disabled={downloading}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                                            darkMode
                                                ? 'bg-green-800 text-green-100 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500'
                                                : 'bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500'
                                        }`}
                                    >
                                        <FontAwesomeIcon icon={faDownload} />
                                        <span>{downloading ? 'Downloading...' : 'Download CSV'}</span>
                                    </button>
                                )}
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                                    darkMode ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                                }`}>
                                    <FontAwesomeIcon icon={faUserGroup} />
                                    <span>{registrations.length} Participants</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {error ? (
                        <ErrorFallback 
                            error={error} 
                            resetError={() => setError(null)}
                            darkMode={darkMode}
                        />
                    ) : registrations.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                                    <tr>
                                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
                                            darkMode ? 'text-gray-300' : 'text-gray-500'
                                        } uppercase tracking-wider`}>
                                            Name
                                        </th>
                                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
                                            darkMode ? 'text-gray-300' : 'text-gray-500'
                                        } uppercase tracking-wider`}>
                                            Roll Number
                                        </th>
                                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
                                            darkMode ? 'text-gray-300' : 'text-gray-500'
                                        } uppercase tracking-wider`}>
                                            Email
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${
                                    darkMode ? 'divide-gray-700' : 'divide-gray-200'
                                }`}>
                                    {registrations.map((user) => (
                                        <tr key={user._id} className={
                                            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                        }>
                                            <td className={`px-6 py-4 whitespace-nowrap ${
                                                darkMode ? 'text-gray-300' : 'text-gray-900'
                                            }`}>
                                                {user.fullName}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap ${
                                                darkMode ? 'text-gray-300' : 'text-gray-900'
                                            }`}>
                                                {user.rollNumber}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap ${
                                                darkMode ? 'text-gray-300' : 'text-gray-900'
                                            }`}>
                                                {user.email}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <p className={`text-lg ${
                                darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                No registrations found for this event.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
