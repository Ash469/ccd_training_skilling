import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';

export default function Login({ darkMode }) {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (accountType === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/user/dashboard');
    }
    return;

    // try {
    //   const response = await axios.post('http://localhost:5000/api/login', {
    //     email,
    //     password,
    //     accountType 
    //   });

    //   if (response.data.success) {
    //     const { token, role } = response.data.data;
        
    //     localStorage.setItem('token', token);
    //     localStorage.setItem('userRole', role);
    //     localStorage.setItem('userData', JSON.stringify(response.data.data));
        
    //     if (role === 'admin') {
    //       navigate('/admin/dashboard');
    //     } else {
    //       navigate('/user/dashboard');
    //     }
    //   }
    // } catch (error) {
    //   setError(
    //     error.response?.data?.message || 
    //     'An error occurred during login'
    //   );
    // } finally {
    //   setLoading(false);
    // }
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
        <div className="text-center space-y-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <img 
              src="/logo.png" 
              alt="IIT Guwahati Logo" 
              className="h-20 w-auto"
            />
            <h1 className="text-2xl font-bold">Training and Skilling IIT Guwahati</h1>
          </div>
        </div>
        {error && (
          <div className={`p-3 rounded-lg ${
            darkMode 
              ? 'bg-red-900 text-red-200' 
              : 'bg-red-100 text-red-600'
          }`}>
            {error}
          </div>
        )}
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 px-4 rounded-lg ${
              darkMode
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            } font-medium transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
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