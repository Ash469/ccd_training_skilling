import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PublicClientApplication } from '@azure/msal-browser';

export default function Login({ darkMode }) {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [msalInstance, setMsalInstance] = useState(null);
  const [msalInitialized, setMsalInitialized] = useState(false);
  
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    // Initialize MSAL instance
    const initializeMsal = async () => {
      try {
        const msalConfig = {
          auth: {
            clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
            authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID}`,
            redirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
          },
          cache: {
            cacheLocation: 'sessionStorage',
            storeAuthStateInCookie: false,
          }
        };

        const msalInstance = new PublicClientApplication(msalConfig);
        await msalInstance.initialize();
        
        setMsalInstance(msalInstance);
        setMsalInitialized(true);
        console.log('MSAL initialized successfully');
      } catch (error) {
        console.error('Error initializing MSAL:', error);
        setError('Failed to initialize Microsoft authentication');
      }
    };

    initializeMsal();
  }, []);

  const handleMicrosoftLogin = async () => {
    if (!msalInitialized || !msalInstance) {
      setError('Microsoft authentication is not ready yet. Please try again in a moment.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Login with popup and request user info
      const loginRequest = {
        scopes: ['user.read', 'profile', 'email', 'openid']
      };

      const response = await msalInstance.loginPopup(loginRequest);
      
      if (response && response.account) {
        // Get access token
        const tokenResponse = await msalInstance.acquireTokenSilent({
          scopes: ['user.read'],
          account: response.account
        });
        
        // Send token to backend
        const backendResponse = await axios.post(`${API_BASE_URL}/api/microsoft-auth`, {
          accessToken: tokenResponse.accessToken,
          accountType
        });
        
        if (backendResponse.data.success) {
          const { token, role } = backendResponse.data.data;
          
          localStorage.setItem('token', token);
          localStorage.setItem('userRole', role);
          localStorage.setItem('userData', JSON.stringify(backendResponse.data.data));
          
          if (role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/user/dashboard');
          }
        }
      }
    } catch (error) {
      console.error('Microsoft login error:', error);
      setError(
        error.response?.data?.message || 
        'An error occurred during Microsoft login'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        email,
        password,
        accountType 
      });

      if (response.data.success) {
        const { token, role } = response.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role);
        localStorage.setItem('userData', JSON.stringify(response.data.data));
        
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/user/dashboard');
        }
      }
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'An error occurred during login'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    } bg-cover bg-center bg-no-repeat`}
    style={{backgroundImage: "url('/background.jpg')"}}>
      <div className={`w-full max-w-md space-y-8 p-8 rounded-xl shadow-lg backdrop-blur-sm ${
        darkMode ? 'text-white' : 'text-gray-900'
      }`}
      style={{
        backgroundColor: darkMode 
          ? 'hsla(240, 10%, 16%, 0.8)' 
          : 'hsla(0, 0%, 100%, 0.85)'
      }}>
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
          
          <div className="relative flex items-center justify-center">
            <hr className={`w-full border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'}`} />
            <span className={`px-2 text-xs font-medium ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'} absolute`}
                 style={{backgroundColor: darkMode ? 'hsla(240, 10%, 16%, 0.8)' : 'hsla(0, 0%, 100%, 0.85)'}}>
              OR
            </span>
          </div>
          
          <button
            type="button"
            onClick={handleMicrosoftLogin}
            disabled={loading || !msalInitialized}
            className={`w-full flex items-center justify-center py-2.5 px-4 rounded-lg ${
              darkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-300'
            } font-medium transition-colors ${
              (loading || !msalInitialized) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="mr-2" viewBox="0 0 16 16">
              <path d="M7.462 0H0v7.19h7.462V0zM16 0H8.538v7.19H16V0zM7.462 8.211H0V16h7.462V8.211zm8.538 0H8.538V16H16V8.211z"/>
            </svg>
            Login with Microsoft
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