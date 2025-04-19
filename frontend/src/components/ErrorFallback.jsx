import React from 'react';

const ErrorFallback = ({ error, resetError, darkMode }) => {
  return (
    <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <h3 className="text-xl font-semibold mb-4">Something went wrong</h3>
      <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {error || 'An unexpected error occurred'}
      </p>
      {resetError && (
        <button
          onClick={resetError}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorFallback;
