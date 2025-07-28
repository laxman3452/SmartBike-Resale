'use client';

import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import useAuth from '@/hooks/useAuth';

export default function Page() {
  const { logout } = useAuth();

  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState('');
  const [userInitials, setUserInitials] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarMessage, setAvatarMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/auth';
    } else {
      setIsChecking(false);
      fetchUserProfile(token);
    }
  }, []);

  useEffect(() => {
    if (user) {
      if (user.avatar) {
        setAvatarSrc(user.avatar);
      } else {
        const initials = user.fullName
          ? user.fullName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
          : '';
        setUserInitials(initials);
        setAvatarSrc('');
      }
    }
  }, [user]);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
      } else {
        console.error('Failed to fetch user profile:', data.message);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMessage('');
    if (!currentPassword || !newPassword) {
      setPasswordMessage('Please fill in both password fields.');
      return;
    }
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setPasswordMessage('Authentication token missing. Please log in again.');
      window.location.href = '/auth';
      return;
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/user/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setPasswordMessage('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setPasswordMessage(data.message || 'Failed to change password.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordMessage('An error occurred. Please try again.');
    }
  };

  const handleUploadAvatar = async (file) => {
    setAvatarMessage('');
    if (!file) {
      setAvatarMessage('Please select an image file to upload.');
      return;
    }
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setAvatarMessage('Authentication token missing. Please log in again.');
      window.location.href = '/auth';
      return;
    }
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/user/profile/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setAvatarMessage('Avatar updated successfully!');
        const newAvatarUrl = data.avatarUrl;
        setUser((prevUser) => ({ ...prevUser, avatar: newAvatarUrl }));
        setAvatarSrc(newAvatarUrl);
        const userDetailsString = localStorage.getItem('userDetails');
        if (userDetailsString) {
          try {
            const userDetails = JSON.parse(userDetailsString);
            userDetails.avatar = newAvatarUrl;
            localStorage.setItem('userDetails', JSON.stringify(userDetails));
            window.dispatchEvent(new CustomEvent('authChange'));
          } catch (error) {
            console.error('Failed to update userDetails in localStorage', error);
          }
        }
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setAvatarMessage('An error occurred during avatar upload. Please try again.');
    }
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleUploadAvatar(file);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Your Profile</h1>

        {isChecking ? (
          <Loader />
        ) : user ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Profile Information Card */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8 pb-6 border-b border-gray-200">
                <div className="relative group w-32 h-32">
                  <div className="w-32 h-32 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt="Avatar"
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${user.fullName}&background=a78bfa&color=fff&size=128`;
                        }}
                      />
                    ) : (
                      <span className="text-4xl font-bold text-purple-700">{userInitials}</span>
                    )}
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer placeholder:text-gray-200 text-gray-500"
                  >
                    <span className="text-white font-semibold text-sm">Change</span>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-3xl font-bold text-gray-800">{user.fullName}</h2>
                  <p className="text-md text-gray-500 mt-1">{user.email}</p>
                </div>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 text-sm">
                <div>
                  <dt className="font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-gray-900 font-semibold text-base">{user.address}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Account Verified</dt>
                  <dd className={`mt-1 font-semibold text-base ${user.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                    {user.isVerified ? 'Verified' : 'Not Verified'}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Member Since</dt>
                  <dd className="mt-1 text-gray-900 font-semibold text-base">{new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</dd>
                </div>
              </dl>
            </div>

            {/* Actions Column */}
            <div className="lg:col-span-1 space-y-8">
              {/* Change Password Section */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Change Password</h3>
                <div className="space-y-4">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder:text-gray-300 text-gray-500"
                    placeholder="Current Password"
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder:text-gray-300 text-gray-500"
                    placeholder="New Password"
                  />
                  <button
                    onClick={handleChangePassword}
                    className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-2.5 px-4 rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-opacity-50"
                  >
                    Update Password
                  </button>
                  {passwordMessage && (
                    <p className={`mt-2 text-sm text-center ${passwordMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Loader />
        )}
      </div>
    </div>
  );
}
