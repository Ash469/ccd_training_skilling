import React from 'react';
import { Link } from 'react-router-dom';

const Footer = ({ darkMode }) => {
  return (
    <footer className={`w-full border-t backdrop-blur ${
      darkMode 
        ? 'bg-gray-900/95 border-gray-800' 
        : 'bg-white/95 border-gray-200'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className={`text-sm text-center ${
          darkMode 
            ? 'text-gray-300' 
            : 'text-gray-700'
        }`}>
          © 2025 Bluebook Developed by Technical Team CCD IITG
        </div>
      </div>
    </footer>
  );
};

export default Footer;