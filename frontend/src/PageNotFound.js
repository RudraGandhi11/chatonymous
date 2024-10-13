import React from 'react';

const PageNotFound = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-teal-200 to-teal-500">
      <div className="bg-white p-10 rounded-lg shadow-lg text-center">
        <h1 className="text-6xl font-bold text-teal-600 mb-4">404</h1>
        <h2 className="text-2xl text-gray-700">Page Not Found</h2>
        <p className="mt-4 text-gray-500">
          Oops! The page you are looking for does not exist.
        </p>
        <a href="/" className="mt-6 inline-block bg-teal-600 text-white py-2 px-4 rounded hover:bg-teal-700 transition duration-200">
          Go Back Home
        </a>
      </div>
    </div>
  );
};

export default PageNotFound;
