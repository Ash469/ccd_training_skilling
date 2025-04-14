import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function Login({ darkMode }) {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mock authentication - replace this with your actual authentication logic
    if (email && password) {
      if (accountType === 'user') {
        navigate('/user/dashboard');
      } else if (accountType === 'admin') {
        navigate('/admin/dashboard');
      }
    }
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
            <h2 className="text-2xl font-bold">Login to your account</h2>
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Enter your email and password to access your account
            </p>
          </div>
        </div>

        {/* Account Type Toggle */}
        <div className={`grid grid-cols-2 gap-2 p-1 rounded-lg ${
          darkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <button
            onClick={() => setAccountType('user')}
            className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              accountType === 'user'
                ? darkMode 
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-600 text-white'
                : darkMode
                  ? 'text-gray-300 hover:bg-gray-600'
                  : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            User
          </button>
          <button
            onClick={() => setAccountType('admin')}
            className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              accountType === 'admin'
                ? darkMode 
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-600 text-white'
                : darkMode
                  ? 'text-gray-300 hover:bg-gray-600'
                  : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Password</label>
              <Link to="/forgot-password" className={`text-sm ${
                darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
              }`}>
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <button
            type="submit"
            className={`w-full py-2.5 px-4 rounded-lg ${
              darkMode
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            } font-medium transition-colors`}
          >
            Login
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center text-sm">
          Don't have an account?{' '}
          <Link to="/register" className={
            darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
          }>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}