import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Login from './pages/login';
import UserDashboard from './pages/user/userDashboard';
import AdminDashboard from './pages/admin/adminDashboard';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Try to get darkMode value from localStorage, default to false if not found
    return JSON.parse(localStorage.getItem('darkMode')) || false;
  });

  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      return newMode;
    });
  };

  // Optional: Sync with system preferences
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const systemPrefersDark = e.matches;
      if (localStorage.getItem('darkMode') === null) {
        setDarkMode(systemPrefersDark);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
        <Route path="/login" element={<Login darkMode={darkMode} />} />
        <Route 
          path="/user/dashboard" 
          element={<UserDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} 
        />
        <Route 
          path="/admin/dashboard" 
          element={<AdminDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} 
        />
      </Routes>
    </Router>
  );
}
