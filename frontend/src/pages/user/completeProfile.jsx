import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building, Home, Phone, Mail, MapPin, GraduationCap, BookOpen, Sun, Moon } from 'lucide-react';

export default function CompleteProfile({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    department: '',
    hostel: '',
    address: '',
    mobileNumber: '',
    alternateMail: '',
    course: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Removed unused state variable

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/profile-status`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // If user already has some data, pre-fill the form
        if (response.data.data) {
          const { department, hostel, address, mobileNumber, alternateMail, course } = response.data.data;
          setFormData({
            department: department || '',
            hostel: hostel || '',
            address: address || '',
            mobileNumber: mobileNumber || '',
            alternateMail: alternateMail || '',
            course: course || ''
          });
        }

        // If profile is already complete, redirect to dashboard
        if (response.data.isProfileComplete) {
          navigate('/user/dashboard');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to fetch user data. Please try again.');
      }
    };

    fetchUserData();
  }, [API_BASE_URL, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/api/update-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Update local storage with new user data
        const updatedUserData = JSON.parse(localStorage.getItem('userData')) || {};
        localStorage.setItem(
          'userData',
          JSON.stringify({
            ...updatedUserData,
            ...response.data.data
          })
        );

        // Redirect to dashboard
        navigate('/user/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Required field validation
  const isFormValid = formData.department && formData.hostel && formData.mobileNumber && formData.course;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
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
              Complete Your Profile
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
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
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto p-6">
        <div className={`mt-6 p-6 rounded-xl shadow-lg ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Complete Your Profile</h2>
            <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Please provide additional information to complete your profile
            </p>
          </div>

          {error && (
            <div className={`p-3 mb-4 rounded-lg ${
              darkMode 
                ? 'bg-red-900/30 text-red-200 border border-red-900' 
                : 'bg-red-100 text-red-600'
            }`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Department */}
              <div>
                <label className="block text-sm font-medium mb-2 items-center gap-2">
                  <Building className="h-4 w-4" />
                  Department <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                  }`}
                  placeholder="e.g. Computer Science & Engineering"
                  required
                />
              </div>

              {/* Course */}
              <div>
                <label className="block text-sm font-medium mb-2 items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Course <span className="text-red-500">*</span>
                </label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                  }`}
                  required
                >
                  <option value="" disabled>Select your course</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="PhD">PhD</option>
                  <option value="B.Des">B.Des</option>
                  <option value="M.Des">M.Des</option>
                  <option value="MSc">MSc</option>
                  <option value="MA">MA</option>
                  <option value="MBA">MBA</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Hostel */}
              <div>
                <label className="block text-sm font-medium mb-2 items-center gap-2">
                  <Home className="h-4 w-4" />
                  Hostel <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="hostel"
                  value={formData.hostel}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                  }`}
                  placeholder="e.g. Dibang/Brahmaputra"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium mb-2 items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Permanent Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                  }`}
                  placeholder="Your permanent address"
                ></textarea>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-medium mb-2 items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                  }`}
                  placeholder="e.g. +91 99XXXXXXXX"
                  required
                />
              </div>

              {/* Alternate Email */}
              <div>
                <label className="block text-sm font-medium mb-2 items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Alternate Email
                </label>
                <input
                  type="email"
                  name="alternateMail"
                  value={formData.alternateMail}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                  }`}
                  placeholder="Your alternate email address"
                />
              </div>

              <div className="pt-4">
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span className="text-red-500">*</span> Required fields
                </p>
                <button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className={`w-full py-3 px-4 rounded-lg font-medium shadow-sm transition-all duration-300 ${
                    loading || !isFormValid
                      ? darkMode
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : darkMode
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {loading ? 'Saving...' : 'Complete Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.clear();
                    navigate('/');
                  }}
                  className={`w-full mt-3 py-2 px-4 rounded-lg text-sm transition-all duration-300 ${
                    darkMode
                      ? 'bg-transparent hover:bg-gray-700 text-gray-400'
                      : 'bg-transparent hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  Logout
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
