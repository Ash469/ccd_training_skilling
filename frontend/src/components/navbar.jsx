import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Moon, Sun } from 'lucide-react';

const Navbar = ({ darkMode, toggleDarkMode }) => {
    return (
        <header className={`sticky top-0 z-50 w-full border-b backdrop-blur ${
            darkMode 
            ? 'bg-gray-900/95 border-gray-800' 
            : 'bg-white/95 border-gray-200'
        }`}>
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                    <img src="/logo.png" alt="CCD Logo" className="h-10" />
                    <span className={darkMode ? 'text-white' : 'text-gray-900'}>Training And Skilling Portal</span>
                </Link>
                <nav className="flex items-center gap-4">
                    <Link to="/login">
                        <button className={`px-4 py-2 rounded-md border ${
                            darkMode 
                            ? 'border-gray-700 hover:bg-gray-800 text-white' 
                            : 'border-gray-200 hover:bg-gray-50 text-gray-900'
                        }`}>
                            Login
                        </button>
                    </Link>
                    <Link to="/register">
                        <button className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white">
                            Register
                        </button>
                    </Link>
                    <button
                        onClick={toggleDarkMode}
                        className={`p-2 rounded-full ${
                            darkMode 
                            ? 'hover:bg-gray-800' 
                            : 'hover:bg-gray-100'
                        }`}
                        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {darkMode ? (
                            <Sun className="h-5 w-5 text-white" />
                        ) : (
                            <Moon className="h-5 w-5 text-gray-900" />
                        )}
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;