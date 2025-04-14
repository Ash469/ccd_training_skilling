import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function Register({ darkMode }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    studentId: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your registration logic here
    console.log('Registration attempt:', formData);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`w-full max-w-md space-y-8 ${
        darkMode 
          ? 'bg-gray-800 text-white' 
          : 'bg-white text-gray-900'
      } p-8 rounded-xl shadow-lg`}>
        {/* Logo and Title */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold">
           <h1>Training and Skilling IIT Guwahati</h1>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Create an account</h2>
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Enter your details to create a new account
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-medium">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              className={`w-full px-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
              }`}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="m@example.com"
              className={`w-full px-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
              }`}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Student ID</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="e.g., 2023CS001"
              className={`w-full px-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
              }`}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                  darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'
                }`}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                  darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'
                }`}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 px-4 rounded-lg ${
              darkMode
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            } font-medium transition-colors`}
          >
            Register
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className={
            darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
          }>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}