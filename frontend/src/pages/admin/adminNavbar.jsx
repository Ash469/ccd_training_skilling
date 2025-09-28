import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon, faSignOutAlt, faBars, faTimes, faChevronDown, faChevronUp, faCalendarAlt, faClipboardList, faUsers } from "@fortawesome/free-solid-svg-icons";

export default function AdminNavbar({ darkMode, toggleDarkMode }) {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [eventsDropdown, setEventsDropdown] = useState(false);
    const [panelsDropdown, setPanelsDropdown] = useState(false);

    return (
        <nav className={`shadow-sm p-4 transition-colors duration-200 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center">
                    <img
                        src="/logo.png"
                        alt="CCD Logo"
                        className="h-12 w-auto mr-3"
                    />
                    <h1 className={`text-xl font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                        Admin Dashboard
                    </h1>
                </div>

                {/* Mobile menu button */}
                <button
                    className="md:hidden p-2 rounded-md"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? (
                        <FontAwesomeIcon
                            icon={faTimes}
                            className={darkMode ? 'text-white' : 'text-gray-800'}
                        />
                    ) : (
                        <FontAwesomeIcon
                            icon={faBars}
                            className={darkMode ? 'text-white' : 'text-gray-800'}
                        />
                    )}
                </button>

                {/* Desktop menu */}
                <div className="hidden md:flex items-center gap-4">
                    {/* Events Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setEventsDropdown((v) => !v)}
                            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-1 transition-all duration-200 ${darkMode
                                ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
                                : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                            }`}
                        >
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            Events
                            <FontAwesomeIcon icon={eventsDropdown ? faChevronUp : faChevronDown} className="ml-1" />
                        </button>
                        {eventsDropdown && (
                            <div className={`absolute z-10 mt-2 w-48 rounded shadow-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                                <button
                                    onClick={() => { navigate('/admin/create-event'); setEventsDropdown(false); }}
                                    className="block w-full text-left px-4 py-2 hover:bg-purple-100 dark:hover:bg-purple-900"
                                >
                                    Create Event
                                </button>
                                <button
                                    onClick={() => { navigate('/admin/dashboard'); setEventsDropdown(false); }}
                                    className="block w-full text-left px-4 py-2 hover:bg-purple-100 dark:hover:bg-purple-900"
                                >
                                    Manage Events
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Panels Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setPanelsDropdown((v) => !v)}
                            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-1 transition-all duration-200 ${darkMode
                                ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
                                : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                            }`}
                        >
                            <FontAwesomeIcon icon={faClipboardList} />
                            Panels
                            <FontAwesomeIcon icon={panelsDropdown ? faChevronUp : faChevronDown} className="ml-1" />
                        </button>
                        {panelsDropdown && (
                            <div className={`absolute z-10 mt-2 w-48 rounded shadow-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                                <button
                                    onClick={() => { navigate('/admin/panel-management'); setPanelsDropdown(false); }}
                                    className="block w-full text-left px-4 py-2 hover:bg-purple-100 dark:hover:bg-purple-900"
                                >
                                    Panel Management
                                </button>
                                <button
                                    onClick={() => { navigate('/admin/slot-user-mappings'); setPanelsDropdown(false); }}
                                    className="block w-full text-left px-4 py-2 hover:bg-purple-100 dark:hover:bg-purple-900"
                                >
                                    User Slot Mapping
                                </button>
                                {/* <button
                                    onClick={() => { navigate('/admin/panel-analytics'); setPanelsDropdown(false); }}
                                    className="block w-full text-left px-4 py-2 hover:bg-purple-100 dark:hover:bg-purple-900"
                                >
                                    Panel Analytics
                                </button> */}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => navigate('/admin/student-analytics')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${darkMode
                            ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
                            : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                        }`}
                    >
                        <FontAwesomeIcon icon={faUsers} className="mr-2" />
                        Student Analytics
                    </button>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        Welcome Admin
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${darkMode ? 'bg-purple-600' : 'bg-purple-700'
                        }`}>
                        A
                    </div>
                    <button
                        onClick={toggleDarkMode}
                        className={`p-2 rounded-full transition-all duration-200 ${darkMode
                            ? 'hover:bg-gray-700 text-yellow-400 hover:text-yellow-300'
                            : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {darkMode ? (
                            <FontAwesomeIcon
                                icon={faSun}
                                className="h-5 w-5 transform hover:rotate-45 transition-transform duration-200"
                            />
                        ) : (
                            <FontAwesomeIcon
                                icon={faMoon}
                                className="h-5 w-5 transform hover:-rotate-12 transition-transform duration-200"
                            />
                        )}
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${darkMode
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className={`md:hidden mt-4 py-3 px-2 rounded-lg shadow-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                    <div className="flex flex-col space-y-3">
                        <div className="flex items-center justify-between px-2 mb-2">
                            <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                Welcome Admin
                            </span>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${darkMode ? 'bg-purple-600' : 'bg-purple-700'
                                }`}>
                                A
                            </div>
                        </div>
                        {/* Events Section */}
                        <div>
                            <div className="font-semibold mb-1 flex items-center gap-2">
                                <FontAwesomeIcon icon={faCalendarAlt} />
                                Events
                            </div>
                            <button
                                onClick={() => { navigate('/admin/create-event'); setMobileMenuOpen(false); }}
                                className={`w-full py-2 text-left rounded ${darkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800'} mb-1`}
                            >
                                Create Event
                            </button>
                            <button
                                onClick={() => { navigate('/admin/events'); setMobileMenuOpen(false); }}
                                className={`w-full py-2 text-left rounded ${darkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                            >
                                Manage Events
                            </button>
                        </div>
                        {/* Panels Section */}
                        <div>
                            <div className="font-semibold mt-3 mb-1 flex items-center gap-2">
                                <FontAwesomeIcon icon={faClipboardList} />
                                Panels
                            </div>
                            <button
                                onClick={() => { navigate('/admin/panels'); setMobileMenuOpen(false); }}
                                className={`w-full py-2 text-left rounded ${darkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800'} mb-1`}
                            >
                                Panel Management
                            </button>
                            <button
                                onClick={() => { navigate('/admin/panel-analytics'); setMobileMenuOpen(false); }}
                                className={`w-full py-2 text-left rounded ${darkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                            >
                                Panel Analytics
                            </button>
                        </div>
                        <button
                            onClick={() => { navigate('/admin/student-analytics'); setMobileMenuOpen(false); }}
                            className={`w-full py-2 text-left rounded ${darkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800'} mt-3`}
                        >
                            <FontAwesomeIcon icon={faUsers} className="mr-2" />
                            Student Analytics
                        </button>
                        <button
                            onClick={toggleDarkMode}
                            className={`w-full py-2 text-center rounded flex items-center justify-center space-x-2 ${darkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                        >
                            {darkMode ? (
                                <>
                                    <FontAwesomeIcon icon={faSun} className="h-4 w-4" />
                                    <span>Light Mode</span>
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faMoon} className="h-4 w-4" />
                                    <span>Dark Mode</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
                            className={`w-full py-2 text-center rounded-lg font-medium ${darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600'}`}
                        >
                            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}