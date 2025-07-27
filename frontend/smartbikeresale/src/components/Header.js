'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';
import { FaUserCircle } from 'react-icons/fa';

const Header = () => {
  const { isAuthenticated, userDetails, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            SmartBike Resale
          </Link>
        </div>

        {/* Navigation Links */}
        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6">
          {isAuthenticated && (
            <>
              <Link href="/price-prediction" className="text-gray-600 hover:text-gray-900 font-medium">Predict & List</Link>
              <Link href="/my-listings" className="text-gray-600 hover:text-gray-900 font-medium">My Listings</Link>
            </>
          )}
        </nav>

        {/* Profile/Auth Icon */}
        <div className="flex items-center">
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2 focus:outline-none">
                {userDetails?.avatar ? (
                  <img
                    src={userDetails.avatar}
                    alt="Profile"
                    className="w-9 h-9 rounded-full object-cover border-2 border-gray-200 hover:border-indigo-500 transition"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold border-2 border-gray-200 hover:border-indigo-500 transition">
                    {getInitials(userDetails?.fullName)}
                  </div>
                )}
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsDropdownOpen(false)}>
                    View Profile
                  </Link>
                  <button onClick={() => { logout(); setIsDropdownOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth">
              <FaUserCircle className="w-8 h-8 text-gray-400" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
