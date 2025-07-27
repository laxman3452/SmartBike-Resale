'use client';

import { useState, useEffect, useCallback } from 'react';

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  const updateAuthState = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    const userDetailsString = localStorage.getItem('userDetails');

    if (token && userDetailsString) {
      try {
        const parsedDetails = JSON.parse(userDetailsString);
        setUserDetails(parsedDetails);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse user details:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userDetails');
        setIsAuthenticated(false);
        setUserDetails(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserDetails(null);
    }
  }, []);

  useEffect(() => {
    updateAuthState();

    window.addEventListener('storage', updateAuthState);
    window.addEventListener('authChange', updateAuthState);

    return () => {
      window.removeEventListener('storage', updateAuthState);
      window.removeEventListener('authChange', updateAuthState);
    };
  }, [updateAuthState]);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userDetails');
    localStorage.removeItem('userId');
    window.dispatchEvent(new CustomEvent('authChange'));
    window.location.href = '/auth';
  }, []);

  return { isAuthenticated, userDetails, logout };
}

export default useAuth;
