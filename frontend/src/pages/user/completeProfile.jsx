import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building, Home, Phone, Mail, MapPin, GraduationCap, BookOpen, Sun, Moon, BookType, CheckCircle, XCircle } from 'lucide-react';

export default function CompleteProfile({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    department: '',
    hostel: '',
    address: '',
    pincode: '',
    mobileNumber: '',
    alternateMail: '',
    programme: '',
    specialization: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

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
          const { department, hostel, address, pincode, mobileNumber, alternateMail, programme, specialization } = response.data.data;
          setFormData({
            department: department || '',
            hostel: hostel || '',
            address: address || '',
            pincode: pincode || '',
            mobileNumber: mobileNumber || '',
            alternateMail: alternateMail || '',
            programme: programme || '',
            specialization: specialization || ''
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

  // This ensures we're logging the formData before submission for debugging
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!showConfirmation) {
      // Log the form data to verify it contains the programme field
      console.log('Form data before submission:', formData);
      setShowConfirmation(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      console.log('Sending form data to server:', formData); // Log data being sent
      const response = await axios.put(
        `${API_BASE_URL}/api/users/profile`,
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
      console.error('Error updating profile:', err.response || err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleConfirmation = () => {
    setShowConfirmation(!showConfirmation);
  };

  // Required field validation
  const isFormValid = formData.department && formData.hostel && formData.mobileNumber && formData.programme;

  // Department options
  const departments = [
    "Computer Science & Engineering",
    "Electronics & Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Biosciences & Bioengineering",
    "Design",
    "Humanities & Social Sciences",
    "Mathematics",
    "Physics",
    "Chemistry",
    "School of Energy Sciences and Engineering",
    "Agro and Rural Technology",
    "Health Sciences and Technology",
    "Centre for Sustainable Polymers",
    "Centre for Disaster Management and Research",
    "School of Data Science and Artificial Intelligence",
    "Other"
  ];

  // Hostel options
  const hostels = [
    "Brahmaputra",
    "Dibang",
    "Dihing",
    "Kameng",
    "Kapili",
    "Lohit",
    "Manas",
    "Siang",
    "Umiam",
    "Barak",
    "Subansiri",
    "Dhansiri",
    "Disang",
    "Married Scholar",
    "Non-Resident"
  ];

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

          {!showConfirmation ? (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Department - Changed to dropdown with improved mobile style */}
                <div>
                  <label className="block text-sm font-medium mb-2 items-center gap-2">
                    <Building className="h-4 w-4 inline-block mr-1" />
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-lg border text-wrap max-h-60 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                    }`}
                    required
                  >
                    <option value="" disabled>Select your department</option>
                    {departments.map((dept, index) => (
                      <option key={index} value={dept} className="text-wrap whitespace-normal">{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Programme - Changed from Course */}
                <div>
                  <label className="block text-sm font-medium mb-2 items-center gap-2">
                    <BookOpen className="h-4 w-4 inline-block mr-1" />
                    Programme <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="programme"
                    value={formData.programme}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                    }`}
                    required
                  >
                    <option value="" disabled>Select your programme</option>
                    <option value="B.Tech">B.Tech</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="PhD">PhD</option>
                    <option value="Phd+M.Sc">M.Sc+PhD</option>
                    <option value="PhD+M.Tech">M.Tech+PhD</option>
                    <option value="B.Des">B.Des</option>
                    <option value="B.Sc">B.Sc</option>
                    <option value="M.Des">M.Des</option>
                    <option value="MSc">MSc</option>
                    <option value="MSc(by Research)">MSc (by Research)</option>
                    <option value="MA">MA</option>
                    <option value="MBA">MBA</option>
                    <option value="B.Sc(Hons) in DS & Al">B.Sc (Hons) in DS & Al</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                {/* Specialization - New field */}
                <div>
                  <label className="block text-sm font-medium mb-2 items-center gap-2">
                    <BookType className="h-4 w-4 inline-block mr-1" />
                    Specialization(if any)
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                    }`}
                    placeholder="e.g. Data Science, Robotics, etc."
                  />
                </div>

                {/* Hostel - Changed to dropdown */}
                <div>
                  <label className="block text-sm font-medium mb-2 items-center gap-2">
                    <Home className="h-4 w-4 inline-block mr-1" />
                    Hostel <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="hostel"
                    value={formData.hostel}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                    }`}
                    required
                  >
                    <option value="" disabled>Select your hostel</option>
                    {hostels.map((hostel, index) => (
                      <option key={index} value={hostel}>{hostel}</option>
                    ))}
                  </select>
                </div>

                {/* Address with Pincode */}
                <div>
                  <label className="block text-sm font-medium mb-2 items-center gap-2">
                    <MapPin className="h-4 w-4 inline-block mr-1" />
                    Permanent Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className={`w-full px-3 py-2 rounded-lg border mb-2 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                    }`}
                    placeholder="Your permanent address"
                  ></textarea>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                    }`}
                    placeholder="Pincode"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-medium mb-2 items-center gap-2">
                    <Phone className="h-4 w-4 inline-block mr-1" />
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
                    <Mail className="h-4 w-4 inline-block mr-1" />
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
                    required
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
                    {loading ? 'Saving...' : 'Review Details'}
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
          ) : (
            <div className="confirmation-modal">
              <h3 className="text-xl font-medium mb-4 text-center">Review Your Details</h3>
              <div className={`p-4 rounded-lg mb-5 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="space-y-3">
                  <div className="flex flex-wrap justify-between">
                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Department:</span>
                    <span className="max-w-[60%] text-right">{formData.department || 'Not provided'}</span>
                  </div>
                  <div className="flex flex-wrap justify-between">
                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Programme:</span>
                    <span className="max-w-[60%] text-right">{formData.programme || 'Not provided'}</span>
                  </div>
                  <div className="flex flex-wrap justify-between">
                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Specialization:</span>
                    <span className="max-w-[60%] text-right">{formData.specialization || 'Not provided'}</span>
                  </div>
                  <div className="flex flex-wrap justify-between">
                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Hostel:</span>
                    <span className="max-w-[60%] text-right">{formData.hostel || 'Not provided'}</span>
                  </div>
                  <div className="flex flex-wrap justify-between">
                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Address:</span>
                    <span className="max-w-[60%] text-right">{formData.address || 'Not provided'}</span>
                  </div>
                  <div className="flex flex-wrap justify-between">
                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Pincode:</span>
                    <span className="max-w-[60%] text-right">{formData.pincode || 'Not provided'}</span>
                  </div>
                  <div className="flex flex-wrap justify-between">
                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Mobile Number:</span>
                    <span className="max-w-[60%] text-right">{formData.mobileNumber || 'Not provided'}</span>
                  </div>
                  <div className="flex flex-wrap justify-between">
                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Alternate Email:</span>
                    <span className="max-w-[60%] text-right">{formData.alternateMail || 'Not provided'}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={toggleConfirmation}
                  className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center ${
                    darkMode 
                      ? 'bg-gray-700 text-white hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  <XCircle className="w-4 h-4 mr-2" /> Edit
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center ${
                    loading
                      ? darkMode 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : 'bg-gray-300 cursor-not-allowed'
                      : darkMode
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> 
                  {loading ? 'Submitting...' : 'Confirm & Submit'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
