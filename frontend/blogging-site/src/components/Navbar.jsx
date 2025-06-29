import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b-2" style={{ borderColor: '#FFBDC5' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full mr-3 flex items-center justify-center" style={{ backgroundColor: '#670626' }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold" style={{ color: '#670626' }}>
                  BlogSite
                </h1>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="px-3 py-2 rounded-md text-sm font-medium transition duration-200 hover:bg-opacity-10"
              style={{ 
                color: '#670626',
                '--tw-bg-opacity-color': '#FFBDC5'
              }}
            >
              Home
            </Link>
            <Link 
              to="/explore" 
              className="px-3 py-2 rounded-md text-sm font-medium transition duration-200 hover:bg-opacity-10"
              style={{ 
                color: '#670626',
                '--tw-bg-opacity-color': '#FFBDC5'
              }}
            >
              Explore
            </Link>
            
            {isAuthenticated && (
              <Link 
                to="/write" 
                className="px-3 py-2 rounded-md text-sm font-medium transition duration-200 hover:bg-opacity-10"
                style={{ 
                  color: '#670626',
                  '--tw-bg-opacity-color': '#FFBDC5'
                }}
              >
                Write
              </Link>
            )}
            
            {/* User Actions */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium" style={{ color: '#670626' }}>
                  Welcome, {user?.username || 'User'}!
                </span>
                <Link 
                  to="/profile" 
                  className="px-3 py-2 rounded-md text-sm font-medium transition duration-200 hover:bg-opacity-10"
                  style={{ 
                    color: '#670626',
                    '--tw-bg-opacity-color': '#FFBDC5'
                  }}
                >
                  Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md text-sm font-medium text-white transition duration-200 hover:shadow-lg transform hover:scale-105"
                  style={{ backgroundColor: '#670626' }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="px-3 py-2 rounded-md text-sm font-medium transition duration-200 hover:bg-opacity-10"
                  style={{ 
                    color: '#670626',
                    '--tw-bg-opacity-color': '#FFBDC5'
                  }}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="px-4 py-2 rounded-md text-sm font-medium text-white transition duration-200 hover:shadow-lg transform hover:scale-105"
                  style={{ backgroundColor: '#670626' }}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md focus:outline-none focus:ring-2 transition duration-200"
              style={{ 
                color: '#670626',
                '--tw-ring-color': '#FFBDC5'
              }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 rounded-lg mt-2 border-2" style={{ backgroundColor: '#F2E0D2', borderColor: '#FFBDC5' }}>
              <Link 
                to="/" 
                className="block px-3 py-2 rounded-md text-base font-medium transition duration-200"
                style={{ color: '#670626' }}
                onClick={toggleMenu}
              >
                Home
              </Link>
              <Link 
                to="/explore" 
                className="block px-3 py-2 rounded-md text-base font-medium transition duration-200"
                style={{ color: '#670626' }}
                onClick={toggleMenu}
              >
                Explore
              </Link>
              
              {isAuthenticated && (
                <Link 
                  to="/write" 
                  className="block px-3 py-2 rounded-md text-base font-medium transition duration-200"
                  style={{ color: '#670626' }}
                  onClick={toggleMenu}
                >
                  Write
                </Link>
              )}
              
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm font-medium" style={{ color: '#670626' }}>
                    Welcome, {user?.username || 'User'}!
                  </div>
                  <Link 
                    to="/profile" 
                    className="block px-3 py-2 rounded-md text-base font-medium transition duration-200"
                    style={{ color: '#670626' }}
                    onClick={toggleMenu}
                  >
                    Profile
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium transition duration-200"
                    style={{ color: '#670626' }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block px-3 py-2 rounded-md text-base font-medium transition duration-200"
                    style={{ color: '#670626' }}
                    onClick={toggleMenu}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-white text-center transition duration-200"
                    style={{ backgroundColor: '#670626' }}
                    onClick={toggleMenu}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;