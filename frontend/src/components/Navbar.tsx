import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, X } from 'lucide-react';
import { useAuthContext } from "@asgardeo/auth-react";

const Navbar = () => {
  const { state, signIn, signOut } = useAuthContext();
  const loggedIn = state.isAuthenticated;
  const user = state.displayName ? { name: state.displayName, email: state.email, ...state } : null;
  // Admin check: only admin@aerox.com
  const admin = user && user.email === "admin@aerox.com";
  // Debug: log user and admin detection (after user/admin are defined)
  if (typeof window !== 'undefined') {
    console.log('Navbar user:', user);
    console.log('Navbar admin:', admin);
  }
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const handleLogout = () => signOut();
  
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
            <a href="http://localhost:8087" className="text-2xl font-bold text-navy-700 hover:text-navy-800 transition-colors" target="_self" rel="noopener noreferrer">
              AeroX
              </a>
            </div>
            {/* Only show navigation links for non-admins */}
            {!admin && (
              <nav className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
                <Link to="/" className="premium-nav-link">
                  Home
                </Link>
                <Link to="/flights" className="premium-nav-link">
                  Book Flight
                </Link>
                <Link to="/air-taxi" className="premium-nav-link">
                  Air Taxi
                </Link>
                <Link to="/flight-status" className="premium-nav-link">
                  Flight Status
                </Link>
              </nav>
            )}
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {loggedIn ? (
              <div className="relative">
                <div className="flex space-x-2">
                  {admin ? (
                    <button
                      onClick={handleLogout}
                      className="inline-flex items-center px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md text-sm font-medium transition-colors"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  ) : (
                    <>
                      <Link to="/user-dashboard" className="inline-flex items-center premium-nav-link">
                        <User className="mr-2 h-4 w-4" />
                        {user?.name || 'Dashboard'}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="inline-flex items-center px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md text-sm font-medium transition-colors"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => signIn()}
                  className="premium-nav-link"
                >
                  Login
                </button>
              </div>
            )}
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-navy-400 hover:text-navy-500 hover:bg-navy-100 focus:outline-none focus:ring-2 focus:ring-navy-500 transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white shadow-lg rounded-b-lg animate-fade-in">
          <div className="pt-2 pb-3 space-y-1">
            {!admin && <>
              <Link
                to="/"
                className="block px-3 py-2 text-navy-600 hover:text-navy-900 hover:bg-navy-50 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/flights"
                className="block px-3 py-2 text-navy-600 hover:text-navy-900 hover:bg-navy-50 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Book Flight
              </Link>
              <Link
                to="/air-taxi"
                className="block px-3 py-2 text-navy-600 hover:text-navy-900 hover:bg-navy-50 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Air Taxi
              </Link>
              <Link
                to="/flight-status"
                className="block px-3 py-2 text-navy-600 hover:text-navy-900 hover:bg-navy-50 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Flight Status
              </Link>
            </>}
            {loggedIn && admin && (
              <button
                onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                className="block w-full text-left px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md text-base font-medium"
              >
                <LogOut className="mr-2 h-4 w-4 inline" />
                Logout
              </button>
            )}
            {loggedIn && !admin && (
              <>
                <Link
                  to="/user-dashboard"
                  className="block px-3 py-2 text-navy-600 hover:text-navy-900 hover:bg-navy-50 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="mr-2 h-4 w-4 inline" />
                  {user?.name || 'Dashboard'}
                </Link>
                <button
                  onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                  className="block w-full text-left px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md text-base font-medium"
                >
                  <LogOut className="mr-2 h-4 w-4 inline" />
                  Logout
                </button>
              </>
            )}
            {!loggedIn && (
              <button
                onClick={() => { setIsMenuOpen(false); signIn(); }}
                className="block w-full text-left px-3 py-2 text-navy-600 hover:text-navy-900 hover:bg-navy-50 rounded-md text-base font-medium"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
