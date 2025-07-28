'use client';

import { useState, useEffect } from 'react';

export default function AuthPage() {

    // State to manage which form is currently displayed: 'register', 'otp', 'login',
    const [currentForm, setCurrentForm] = useState('login');
    // State to hold form data for registration
    const [registerFormData, setRegisterFormData] = useState({
        fullName: '',
        email: '',
        address: '',
        password: '',
    });
    // State to hold OTP input for registration verification
    const [otp, setOtp] = useState('');
    // State to hold form data for login
    const [loginFormData, setLoginFormData] = useState({
        email: '',
        password: '',
    });
    // State to display messages to the user (e.g., success, error from API)
    const [message, setMessage] = useState('');
    // State to store the userId, primarily used for OTP verification during registration
    const [userId, setUserId] = useState('');
    // State to indicate loading status during API calls
    const [isLoading, setIsLoading] = useState(false);

    // States for Forgot Password functionality
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [forgotPasswordOtp, setForgotPasswordOtp] = useState('');
    const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);


    // Effect to check for userId in localStorage on component mount.
    // This helps in cases where the user might refresh the page during OTP verification.
    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(storedUserId);
        }
    }, []);

    // Handler for changes in registration form inputs
    const handleRegisterChange = (e) => {
        setRegisterFormData({ ...registerFormData, [e.target.name]: e.target.value });
    };

    // Handler for changes in login form inputs
    const handleLoginChange = (e) => {
        setLoginFormData({ ...loginFormData, [e.target.name]: e.target.value });
    };

    // Handler for OTP input change (used for both registration and forgot password)
    const handleOtpChange = (e) => {
        setOtp(e.target.value);
        setForgotPasswordOtp(e.target.value); // Also update forgot password OTP
    };

    // Handler for new password input change in forgot password flow
    const handleNewPasswordChange = (e) => {
        setNewPassword(e.target.value);
    };


    // Handles the registration submission
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages
        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registerFormData),
            });

            const data = await response.json();
            setMessage(data.message); // Display message from API

            if (response.ok && response.status === 201) {
                // If registration is successful (status 201)
                const newUserId = data.userId;
                localStorage.setItem('userId', newUserId); // Store userId in localStorage
                setUserId(newUserId);
                setCurrentForm('otp'); // Switch to OTP verification form
            }
            else if (response.ok && response.status === 200) {
                // If registration is successful but user is not verified then(status 200)
                const newUserId = data.userId;
                localStorage.setItem('userId', newUserId); // Store userId in localStorage
                setUserId(newUserId);
                setCurrentForm('otp'); // Switch to OTP verification form
            }
            else if (response.status === 400 && data.message === 'Email already registered and verified') {
                // Specific case: Email already registered and verified
                setCurrentForm('login'); // Switch to login form
            } else {
                // Handle other registration errors (e.g., validation errors)
                console.error('Registration failed:', data);
            }
        } catch (error) {
            setMessage('Network error. Please try again.');
            console.error('Error during registration:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handles the OTP verification submission for registration
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages
        setIsLoading(true);

        if (!userId) {
            setMessage('User ID not found. Please register again.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/register/verify/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ otp }),
            });

            const data = await response.json();
            setMessage(data.message); // Display message from API

            if (response.ok && response.status === 200) {
                // If OTP verification is successful
                setCurrentForm('login'); // Switch to login form
                setOtp(''); // Clear OTP field
            } else {
                console.error('OTP verification failed:', data);
            }
        } catch (error) {
            setMessage('Network error. Please try again.');
            console.error('Error during OTP verification:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handles the login submission
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages
        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginFormData),
            });

            const data = await response.json();
            if (response.ok && response.status === 200) {
                // If login is successful
                localStorage.setItem('accessToken', data.accessToken);
                // Storing the entire user object in localStorage
                localStorage.setItem('userDetails', JSON.stringify(data.user));
                localStorage.setItem('userId', data.user._id); // Storing userId separately for convenience

                // Manually trigger an auth state change event to update the header
                window.dispatchEvent(new CustomEvent('authChange'));

                // Redirect to homepage immediately
                window.location.href = '/';
            } else if (response.status === 401 && data.message === 'Account not verified. OTP sent to your email') {
                // Specific case: Account not verified, needs OTP
                const storedUserId = localStorage.getItem('userId');
                if (storedUserId) {
                    setUserId(storedUserId); // Ensure userId is set for OTP form
                }
                setCurrentForm('otp'); // Switch to OTP verification form
            } else {
                setMessage(data.message || 'Login failed. Please check your credentials.');
                console.error('Login failed:', data);
            }
        } catch (error) {
            setMessage('Network error. Please try again.');
            console.error('Error during login:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handles requesting OTP for forgot password
    const handleForgotPasswordRequest = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsForgotPasswordLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: forgotPasswordEmail }),
            });

            const data = await response.json();
            setMessage(data.message);

            if (response.ok && response.status === 200) {
                setCurrentForm('forgotPasswordOtpEntry'); // Switch to OTP and new password form
                setOtp(''); // Clear OTP field
                setNewPassword(''); // Clear new password field
            } else {
                console.error('Forgot password request failed:', data);
            }
        } catch (error) {
            setMessage('Network error. Please try again.');
            console.error('Error during forgot password request:', error);
        } finally {
            setIsForgotPasswordLoading(false);
        }
    };

    // Handles verifying OTP and resetting password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsForgotPasswordLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/verify/otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: forgotPasswordEmail,
                    otp: forgotPasswordOtp,
                    newPassword: newPassword,
                }),
            });

            const data = await response.json();
            setMessage(data.message);

            if (response.ok && response.status === 200) {
                setCurrentForm('login'); // Go back to login form on success
                setForgotPasswordEmail('');
                setForgotPasswordOtp('');
                setNewPassword('');
            } else {
                console.error('Password reset failed:', data);
            }
        } catch (error) {
            setMessage('Network error. Please try again.');
            console.error('Error during password reset:', error);
        } finally {
            setIsForgotPasswordLoading(false);
        }
    };

    // --- Render Logic ---
    const inputClasses = "w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200";
    const buttonClasses = "w-full py-3 px-4 rounded-lg text-white font-bold transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed";
    const messageClasses = "text-center font-medium mb-4 p-3 rounded-lg";

    const renderMessage = () => {
        if (!message) return null;
        const isSuccess = message.includes('successful') || message.includes('verified') || message.includes('sent');
        return (
            <p className={`${messageClasses} ${isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message}
            </p>
        );
    };

    const renderForm = () => {
        switch (currentForm) {
            case 'register':
                return (
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        <input type="text" name="fullName" placeholder="Full Name" value={registerFormData.fullName} onChange={handleRegisterChange} className={inputClasses} required />
                        <input type="email" name="email" placeholder="Email Address" value={registerFormData.email} onChange={handleRegisterChange} className={inputClasses} required />
                        <input type="text" name="address" placeholder="Address" value={registerFormData.address} onChange={handleRegisterChange} className={inputClasses} required />
                        <input type="password" name="password" placeholder="Password" value={registerFormData.password} onChange={handleRegisterChange} className={inputClasses}  minLength={8} required />
                        <button type="submit" className={`${buttonClasses} bg-blue-600 hover:bg-blue-700`} disabled={isLoading}>
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>
                );
            case 'login':
                return (
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                        <input type="email" name="email" placeholder="Email Address" value={loginFormData.email} onChange={handleLoginChange} className={inputClasses} required />
                        <input type="password" name="password" placeholder="Password" value={loginFormData.password} onChange={handleLoginChange} className={inputClasses} required />
                        <button type="submit" className={`${buttonClasses} bg-blue-600 hover:bg-blue-700`} disabled={isLoading}>
                            {isLoading ? 'Logging In...' : 'Login'}
                        </button>
                        <p className="text-center text-sm text-gray-600">
                            <button onClick={() => { setCurrentForm('forgotPassword'); setMessage(''); }} className="text-blue-600 hover:underline font-medium">
                                Forgot Password?
                            </button>
                        </p>
                    </form>
                );
            case 'otp':
                return (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <p className="text-center text-gray-600">An OTP has been sent to your email. Please enter it below.</p>
                        <input type="text" name="otp" placeholder="Enter OTP" value={otp} onChange={handleOtpChange} className={inputClasses} required />
                        <button type="submit" className={`${buttonClasses} bg-blue-600 hover:bg-blue-700`} disabled={isLoading}>
                            {isLoading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </form>
                );
            case 'forgotPassword':
                return (
                    <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                         <p className="text-center text-gray-600">Enter your email to receive a password reset OTP.</p>
                        <input type="email" name="email" placeholder="Email Address" value={forgotPasswordEmail} onChange={(e) => setForgotPasswordEmail(e.target.value)} className={inputClasses} required />
                        <button type="submit" className={`${buttonClasses} bg-blue-600 hover:bg-blue-700`} disabled={isForgotPasswordLoading}>
                            {isForgotPasswordLoading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                );
            case 'forgotPasswordOtpEntry':
                return (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <p className="text-center text-gray-600">Enter the OTP from your email and your new password.</p>
                        <input type="text" name="otp" placeholder="Enter OTP" value={forgotPasswordOtp} onChange={(e) => setForgotPasswordOtp(e.target.value)} className={inputClasses} required />
                        <input type="password" name="newPassword" placeholder="New Password" value={newPassword} onChange={handleNewPasswordChange} className={inputClasses} required />
                        <button type="submit" className={`${buttonClasses} bg-blue-600 hover:bg-blue-700`} disabled={isForgotPasswordLoading}>
                            {isForgotPasswordLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                    <div className="flex mb-6 border-b border-gray-200">
                        <button
                            onClick={() => { setCurrentForm('login'); setMessage(''); }}
                            className={`flex-1 py-3 font-bold text-center transition-colors duration-300 ${currentForm === 'login' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                            Login
                        </button>
                        <button
                            onClick={() => { setCurrentForm('register'); setMessage(''); }}
                            className={`flex-1 py-3 font-bold text-center transition-colors duration-300 ${currentForm === 'register' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                            Register
                        </button>
                    </div>

                    {renderMessage()}
                    {renderForm()}

                    {(currentForm === 'forgotPassword' || currentForm === 'forgotPasswordOtpEntry') && (
                         <p className="text-center text-sm text-gray-600 mt-4">
                            Remembered your password?{' '}
                            <button onClick={() => { setCurrentForm('login'); setMessage(''); }} className="text-blue-600 hover:underline font-medium">
                                Login
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
