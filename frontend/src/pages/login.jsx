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
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [loginMethod, setLoginMethod] = useState('microsoft'); // 'microsoft' or 'password'
  
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
        
        // Try to handle any redirect promises when the component mounts
        // This helps clear any lingering authentication state
        try {
          await msalInstance.handleRedirectPromise();
        } catch (err) {
          console.warn("Redirect promise handling error:", err);
          // Continue anyway as this is just cleanup
        }
        
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

  const checkEmailAccess = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsCheckingEmail(true);
    setError('');
    
    try {
      // Check if the email is allowed based on accountType
      const response = await axios.post(`${API_BASE_URL}/api/check-email-access`, {
        email: email.toLowerCase(),
        accountType
      });
      
      if (response.data.allowed) {
        setIsEmailVerified(true);
        setError('');
        // For admin accounts, default to password login
        if (accountType === 'admin') {
          setLoginMethod('password');
        }
      } else {
        setError(
          accountType === 'admin'
            ? 'This email is not authorized for admin access.'
            : 'Your email is not authorized to access this portal. Please contact CCD for more information.'
        );
      }
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'An error occurred while verifying your email. Please try again.'
      );
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        email: email.toLowerCase(),
        password,
        accountType
      });
      
      if (response.data.success) {
        const { token, role } = response.data.data;
        
        // Clear any previous data
        localStorage.clear();
        
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role);
        localStorage.setItem('userData', JSON.stringify(response.data.data));
        
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    if (!msalInitialized || !msalInstance) {
      setError('Microsoft authentication is not ready yet. Please try again in a moment.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Clear any existing sessions before attempting a new login
      sessionStorage.clear();
      
      // Check for existing interaction in progress
      if (msalInstance.getActiveAccount()) {
        // Attempt to end any existing sessions
        try {
          // Log out the active account silently
          const accounts = msalInstance.getAllAccounts();
          if (accounts.length > 0) {
            await msalInstance.logoutPopup({
              account: accounts[0],
              postLogoutRedirectUri: window.location.origin
            });
          }
        } catch (err) {
          console.warn("Failed to clear previous session:", err);
          // Continue anyway - we'll try a new login
        }
      }

      // Login with popup and request user info
      const loginRequest = {
        scopes: ['user.read', 'profile', 'email', 'openid'],
        prompt: 'select_account', // Force account selection
        loginHint: email // Use the verified email as a hint
      };

      const response = await msalInstance.loginPopup(loginRequest);
      
      if (response && response.account) {
        // Get access token
        const tokenResponse = await msalInstance.acquireTokenSilent({
          scopes: ['user.read'],
          account: response.account
        });
        
        // Get user email from account
        const userEmail = response.account.username;
        
        // Send token to backend
        const backendResponse = await axios.post(`${API_BASE_URL}/api/microsoft-auth`, {
          accessToken: tokenResponse.accessToken,
          email: userEmail,
          accountType
        });
        
        if (backendResponse.data.success) {
          const { token, role, isProfileComplete } = backendResponse.data.data;
          
          // Clear any previous data first
          localStorage.clear();
          
          localStorage.setItem('token', token);
          localStorage.setItem('userRole', role);
          localStorage.setItem('userData', JSON.stringify(backendResponse.data.data));
          
          if (role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            // Check if profile is complete
            if (!isProfileComplete) {
              navigate('/user/complete-profile');
            } else {
              navigate('/user/dashboard');
            }
          }
        }
      }
    } catch (error) {
      console.error('Microsoft login error:', error);
      
      // Special handling for interaction_in_progress error
      if (error.errorCode === 'interaction_in_progress') {
        setError('Another login attempt is in progress. Please wait a moment and try again.');
        
        // Try to reset the interaction state
        try {
          sessionStorage.clear();
          // Wait a moment
          setTimeout(() => {
            window.location.reload(); 
          }, 1000);
        } catch (err) {
          console.error("Failed to reset interaction state:", err);
        }
      } else if (error.response?.status === 403) {
        // Special handling for unauthorized emails
        setError(
          'Your email is not authorized to access this portal. Please contact CCD for more information.'
        );
      } else {
        setError(
          error.response?.data?.message || 
          error.message || 
          'An error occurred during Microsoft login'
        );
      }
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
            <div className='gap-0'>
              <h1 className="text-2xl font-bold">Training and Skilling Portal</h1>
              <h1 className="text-2xl font-bold">IIT Guwahati</h1>
            </div>
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
            onClick={() => {
              setAccountType('user');
              setIsEmailVerified(false);
              setLoginMethod('microsoft');
            }}
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
            Student
          </button>
          <button
            onClick={() => {
              setAccountType('admin');
              setIsEmailVerified(false);
            }}
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
            CCD Admin
          </button>
        </div>

        {!isEmailVerified ? (
          <div className="space-y-6">
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
            
            <button
              type="button"
              onClick={checkEmailAccess}
              disabled={isCheckingEmail}
              className={`w-full py-2.5 px-4 rounded-lg ${
                darkMode
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              } font-medium transition-colors ${
                isCheckingEmail ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isCheckingEmail ? 'Checking...' : 'Continue'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-100 text-green-800 p-3 rounded-lg">
              <p className="font-medium">Email verified: {email}</p>
              <p className="text-sm">Please proceed with login.</p>
            </div>
            
            {/* For admin users, show login method toggle */}
            {accountType === 'admin' && (
              <div className={`grid grid-cols-2 gap-2 p-1 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <button
                  onClick={() => setLoginMethod('password')}
                  className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    loginMethod === 'password'
                      ? darkMode 
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-600 text-white'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-600'
                        : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Password Login
                </button>
                <button
                  onClick={() => setLoginMethod('microsoft')}
                  className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    loginMethod === 'microsoft'
                      ? darkMode 
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-600 text-white'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-600'
                        : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Microsoft Login
                </button>
              </div>
            )}
            
            {/* Password login form for admins */}
            {accountType === 'admin' && loginMethod === 'password' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                    }`}
                    required
                  />
                </div>
                
                <button
                  type="button"
                  onClick={handlePasswordLogin}
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
              </div>
            )}
            
            {/* Microsoft login button - show for students or admins who selected Microsoft login */}
            {(accountType === 'user' || (accountType === 'admin' && loginMethod === 'microsoft')) && (
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
              {loading ? 'Logging in...' : 'Login with Microsoft'}
            </button>
            )}
            
            <button 
              type="button"
              onClick={() => setIsEmailVerified(false)}
              className={`w-full py-2 px-3 rounded-lg ${
                darkMode
                  ? 'bg-gray-600 hover:bg-gray-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              } text-sm font-medium transition-colors`}
            >
              Use a different email
            </button>
          </div>
        )}
          
        <p className="text-center text-sm">
          Don't have an account?{' '}
          <span
            className={`font-medium ${
              darkMode
                ? 'text-purple-400 hover:text-purple-300'
                : 'text-purple-600 hover:text-purple-700'
            }`}
          >
            Contact ccd@iitg.ac.in and Register now
          </span>
        </p>
      </div>
    </div>
  );
}