import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faSun,
  faMoon,
  faCheckCircle,
  faTimesCircle,
  faQuestionCircle,
  faChartBar,
  faBars,
  faTimes,
  faUser,
  faCalendarCheck,
  faCalendarXmark,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

import Footer from '../../components/footer';


export default function StudentAnalytics({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        setError('Authentication required. Please login again.');
        setLoading(false);
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      console.log('Fetching students from:', `${API_BASE_URL}/api/users/students`);
      console.log('Using auth token:', token.substring(0, 10) + '...');
      
      // Fetch all students
      const response = await axios.get(`${API_BASE_URL}/api/users/students`, config);
      console.log('API Response:', response);
      
      // Check if the response contains data directly (different response format)
      if (Array.isArray(response.data)) {
        console.log('Response is an array, using directly');
        setStudents(response.data);
        setError(null);
      } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        console.log('Response has success and data properties');
        setStudents(response.data.data);
        setError(null);
      } else if (response.data && Array.isArray(response.data.students)) {
        // Another potential format
        console.log('Response has students array property');
        setStudents(response.data.students);
        setError(null);
      } else {
        console.error('Invalid response format:', response.data);
        setError('Received invalid data format from server');
        
        // Try to use the response data directly as a fallback
        if (response.data && typeof response.data === 'object') {
          console.log('Attempting to use response.data directly as fallback');
          setStudents([response.data]);
        }
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      
      // More detailed error logging
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response error data:', err.response.data);
        console.error('Response status:', err.response.status);
        
        if (err.response.status === 401 || err.response.status === 403) {
          // Authentication or Authorization error
          setError('Please login again to access this page');
          // Redirect to login page after a short delay
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          setError(`Server error: ${err.response.data?.message || err.response.statusText || 'Unknown error'}`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
        setError('Server did not respond. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request error:', err.message);
        setError(`Request failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetails = async (rollNumber) => {
    if (selectedStudent === rollNumber) {
      // If clicking the same student, toggle the details view
      setSelectedStudent(null);
      setStudentDetails(null);
      return;
    }

    try {
      setDetailsLoading(true);
      setSelectedStudent(rollNumber);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login again.');
        setDetailsLoading(false);
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      console.log('Fetching student details for:', rollNumber);
      const response = await axios.get(`${API_BASE_URL}/api/users/students/${rollNumber}`, config);
      
      if (response.data && response.data.success) {
        setStudentDetails(response.data.data);
        setError(null);
      } else {
        setError('Failed to get student details');
      }
    } catch (err) {
      console.error('Error fetching student details:', err);
      setError(err.response?.data?.message || 'Failed to fetch student details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredStudents = students.filter((student) =>
    student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber?.toString().includes(searchTerm) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRetry = () => {
    setError(null);
    fetchStudents();
  };

  // Display loading spinner when fetching data
  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="mt-2">Loading students data...</p>
      </div>
    );
  }

  // Display error message with retry button
  if (error) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'
      }`}>
        <div className={`max-w-md w-full p-6 rounded-lg shadow-lg ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="text-red-500 flex items-center justify-center text-4xl mb-4">
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </div>
          <h2 className={`text-center text-lg font-medium mb-3 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>Error Loading Data</h2>
          <p className={`text-center mb-6 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>{error}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className={`px-4 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200  ${
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
              className="h-10 w-auto mr-2 sm:h-12 sm:mr-3" 
            />
            <h1 className={`text-lg sm:text-xl font-semibold ${
              darkMode ? 'text-purple-400' : 'text-purple-600'
            }`}>
              Student Analytics
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
              onClick={() => navigate('/admin/dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                darkMode
                  ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
                  : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
              }`}
            >
              Dashboard
            </button>
            <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
              Welcome Admin
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
                  Welcome Admin
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
                Dashboard
              </button>
              
              <button
                onClick={() => navigate('/admin/create-event')}
                className={`w-full py-2 text-center rounded ${
                  darkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800'
                }`}
              >
                Create Event
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

      <div className="max-w-7xl mx-auto px-3 py-4 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <div className={`flex items-center p-2 sm:p-3 rounded-lg shadow-sm ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <FontAwesomeIcon 
              icon={faSearch} 
              className={`h-4 sm:h-5 w-4 sm:w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} 
            />
            <input
              type="text"
              placeholder="Search student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`ml-2 sm:ml-3 w-full outline-none text-sm sm:text-base ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'
              }`}
            />
          </div>
        </div>

        {students.length === 0 ? (
          <div className={`text-center p-8 rounded-lg shadow ${
            darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'
          }`}>
            <FontAwesomeIcon 
              icon={faUser} 
              className={`text-4xl mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
            />
            <p className="text-lg mb-2">No students found in the database</p>
            <p className="text-sm">Students will appear here once they register on the platform</p>
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <div key={student._id} className="mb-4">
                <div 
                  className={`p-4 rounded-lg shadow cursor-pointer transition-all duration-200 ${
                    selectedStudent === student.rollNumber 
                      ? darkMode 
                        ? 'bg-gray-700 ring-2 ring-purple-500' 
                        : 'bg-white ring-2 ring-purple-400'
                      : darkMode 
                        ? 'bg-gray-800 hover:bg-gray-700' 
                        : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => fetchStudentDetails(student.rollNumber)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className={`p-2 rounded-full ${
                        darkMode ? 'bg-gray-700' : 'bg-purple-100'
                      }`}>
                        <FontAwesomeIcon 
                          icon={faUser} 
                          className={`text-xs sm:text-base ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} 
                        />
                      </div>
                      <div>
                        <h3 className={`font-medium text-sm sm:text-base ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {student.fullName || 'Unknown'}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-xs sm:text-sm">
                          <span className={
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }>
                            {student.rollNumber || 'No Roll Number'}
                          </span>
                          <span className={`hidden sm:inline ${
                            darkMode ? 'text-gray-500' : 'text-gray-400'
                          }`}>•</span>
                          <span className={
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }>
                            {student.email || 'No Email'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs ${
                      darkMode 
                        ? 'bg-purple-500/10 text-purple-400' 
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {student.events?.length || 0} Events
                    </div>
                  </div>
                </div>

                {/* Student Details Section */}
                {selectedStudent === student.rollNumber && (
                  <div className={`mt-2 p-4 rounded-lg shadow transition-all duration-200 ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    {detailsLoading ? (
                      <div className="py-8 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                      </div>
                    ) : studentDetails ? (
                      <div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                          <div className={`p-3 sm:p-4 rounded-lg ${
                            darkMode ? 'bg-gray-800' : 'bg-white'
                          } shadow`}>
                            <div className="flex items-center gap-2 sm:gap-3 mb-2">
                              <FontAwesomeIcon 
                                icon={faUser} 
                                className={`text-sm sm:text-base ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} 
                              />
                              <h4 className={`text-sm sm:text-base font-medium ${
                                darkMode ? 'text-gray-200' : 'text-gray-800'
                              }`}>
                                Student Info
                              </h4>
                            </div>
                            <ul className="space-y-2 text-xs sm:text-sm">
                              <li className="flex justify-between">
                                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Name:</span>
                                <span className="font-medium">{studentDetails.student.fullName}</span>
                              </li>
                              <li className="flex justify-between">
                                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Roll Number:</span>
                                <span className="font-medium">{studentDetails.student.rollNumber}</span>
                              </li>
                              <li className="flex justify-between">
                                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Email:</span>
                                <span className="font-medium">{studentDetails.student.email}</span>
                              </li>
                            </ul>
                          </div>

                          <div className={`p-3 sm:p-4 rounded-lg ${
                            darkMode ? 'bg-gray-800' : 'bg-white'
                          } shadow`}>
                            <div className="flex items-center gap-2 sm:gap-3 mb-2">
                              <FontAwesomeIcon 
                                icon={faChartBar} 
                                className={`text-sm sm:text-base ${darkMode ? 'text-green-400' : 'text-green-600'}`} 
                              />
                              <h4 className={`text-sm sm:text-base font-medium ${
                                darkMode ? 'text-gray-200' : 'text-gray-800'
                              }`}>
                                Attendance Stats
                              </h4>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center mt-4">
                              <div>
                                <div className={`text-2xl font-bold ${
                                  darkMode ? 'text-gray-200' : 'text-gray-800'
                                }`}>
                                  {studentDetails.analytics.totalEvents}
                                </div>
                                <div className={`text-xs ${
                                  darkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  Registered
                                </div>
                              </div>
                              <div>
                                <div className={`text-2xl font-bold ${
                                  darkMode ? 'text-gray-200' : 'text-gray-800'
                                }`}>
                                  {studentDetails.analytics.eventsAttended}
                                </div>
                                <div className={`text-xs ${
                                  darkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  Attended
                                </div>
                              </div>
                              <div>
                                <div className={`text-2xl font-bold ${
                                  studentDetails.analytics.attendanceRate >= 75 
                                    ? 'text-green-500' 
                                    : studentDetails.analytics.attendanceRate >= 50 
                                      ? 'text-yellow-500' 
                                      : 'text-red-500'
                                }`}>
                                  {studentDetails.analytics.attendanceRate}%
                                </div>
                                <div className={`text-xs ${
                                  darkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  Rate
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className={`p-3 sm:p-4 rounded-lg ${
                            darkMode ? 'bg-gray-800' : 'bg-white'
                          } shadow`}>
                            <div className="flex items-center gap-2 sm:gap-3 mb-2">
                              <FontAwesomeIcon 
                                icon={faCalendarCheck} 
                                className={`text-sm sm:text-base ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} 
                              />
                              <h4 className={`text-sm sm:text-base font-medium ${
                                darkMode ? 'text-gray-200' : 'text-gray-800'
                              }`}>
                                Event Summary
                              </h4>
                            </div>
                            <ul className="space-y-2 text-xs sm:text-sm">
                              <li className="flex justify-between">
                                <div className="flex items-center">
                                  <FontAwesomeIcon 
                                    icon={faCalendarCheck} 
                                    className={`mr-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`} 
                                  />
                                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Attended:</span>
                                </div>
                                <span className="font-medium">{studentDetails.analytics.eventsAttended}</span>
                              </li>
                              <li className="flex justify-between">
                                <div className="flex items-center">
                                  <FontAwesomeIcon 
                                    icon={faCalendarXmark} 
                                    className={`mr-2 ${darkMode ? 'text-red-400' : 'text-red-600'}`} 
                                  />
                                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Missed:</span>
                                </div>
                                <span className="font-medium">
                                  {studentDetails.analytics.totalEvents - studentDetails.analytics.eventsAttended}
                                </span>
                              </li>
                              <li className="flex justify-between mt-2">
                                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Overall:</span>
                                <div className="w-24 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                  <div 
                                    className={`h-2.5 rounded-full ${
                                      studentDetails.analytics.attendanceRate >= 75 
                                        ? 'bg-green-600' 
                                        : studentDetails.analytics.attendanceRate >= 50 
                                          ? 'bg-yellow-400' 
                                          : 'bg-red-600'
                                    }`}
                                    style={{ width: `${studentDetails.analytics.attendanceRate}%` }}
                                  ></div>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>

                        {/* Events History */}
                        <div className={`p-3 sm:p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                          <h4 className={`text-sm sm:text-base font-medium mb-3 sm:mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            Event History
                          </h4>

                          {studentDetails.events.length > 0 ? (
                            <div className="overflow-x-auto -mx-3 sm:mx-0">
                              <table className="w-full min-w-[640px]">
                                <thead>
                                  <tr className={darkMode ? 'border-b border-gray-700' : 'border-b'}>
                                    <th className="py-2 text-left text-xs sm:text-sm">Event Name</th>
                                    <th className="py-2 text-left text-xs sm:text-sm">Date</th>
                                    <th className="py-2 text-left text-xs sm:text-sm">Venue</th>
                                    <th className="py-2 text-left text-xs sm:text-sm">Status</th>
                                    <th className="py-2 text-left text-xs sm:text-sm">Attendance</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {studentDetails.events.map((event) => (
                                    <tr 
                                      key={event.id} 
                                      className={darkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'}
                                    >
                                      <td className="py-2 sm:py-3 text-xs sm:text-sm">{event.name}</td>
                                      <td className="py-2 sm:py-3 text-xs sm:text-sm">
                                        {new Date(event.date).toLocaleDateString()}
                                      </td>
                                      <td className="py-2 sm:py-3 text-xs sm:text-sm">{event.venue}</td>
                                      <td className="py-2 sm:py-3">
                                        <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs ${
                                          event.status === 'upcoming'
                                            ? darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-800'
                                            : event.status === 'ongoing'
                                              ? darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                                              : darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-800'
                                        }`}>
                                          {event.status}
                                        </span>
                                      </td>
                                      <td className="py-2 sm:py-3">
                                        {event.attended === null ? (
                                          <span className="flex items-center text-xs sm:text-sm">
                                            <FontAwesomeIcon 
                                              icon={faQuestionCircle} 
                                              className={`mr-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} 
                                            />
                                            <span>Not verified</span>
                                          </span>
                                        ) : event.attended ? (
                                          <span className="flex items-center text-green-500 text-xs sm:text-sm">
                                            <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                                            <span>Present</span>
                                          </span>
                                        ) : (
                                          <span className="flex items-center text-red-500 text-xs sm:text-sm">
                                            <FontAwesomeIcon icon={faTimesCircle} className="mr-1" />
                                            <span>Absent</span>
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              No events registered
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Failed to load student details. Please try again.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center p-8 rounded-lg ${
            darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'
          }`}>
            {searchTerm ? 'No students found matching your search criteria.' : 'No students available.'}
          </div>
        )}

      </div>
      {/* <Footer darkMode={darkMode} /> */}
    </div>
    
  );
}
