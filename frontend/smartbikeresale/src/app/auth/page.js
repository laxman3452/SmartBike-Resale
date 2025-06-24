'use client';

import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation'; // Removed due to compilation error

export default function AuthPage() {

    // State to manage which form is currently displayed: 'register', 'otp', 'login',
    const [currentForm, setCurrentForm] = useState('register');
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
                const newUserId = data.user._id;
                localStorage.setItem('userId', newUserId); // Store userId in localStorage
                setUserId(newUserId);
                setCurrentForm('otp'); // Switch to OTP verification form
            } else if (response.status === 400 && data.message === 'Email already registered and verified') {
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
            setMessage(data.message); // Display message from API

            if (response.ok && response.status === 200) {
                // If login is successful
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('userId', data.user._id);
                localStorage.setItem('userDetails', JSON.stringify(data.user)); // Store full user details
                window.location.href = '/'; // Using direct window navigation to resolve compilation issue
            } else if (response.status === 401 && data.message === 'Account not verified. OTP sent to your email') {
                // Specific case: Account not verified, needs OTP
                const storedUserId = localStorage.getItem('userId');
                if (storedUserId) {
                    setUserId(storedUserId); // Ensure userId is set for OTP form
                }
                setCurrentForm('otp'); // Switch to OTP verification form
            } else {
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

    // Common styling for form containers
    const formContainerClasses = "bg-white p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-200";
    // Common styling for input fields, now including placeholder color
    const inputClasses = "w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent placeholder-gray-500 text-gray-500";
    // Common styling for buttons
    const buttonClasses = "w-full p-3 rounded-md text-white font-semibold transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed";
    // Styling for success messages
    const successMessageClasses = "text-green-700 font-medium mb-4";
    // Styling for error/info messages
    const errorMessageClasses = "text-red-600 font-medium mb-4";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-inter">
            <div className={formContainerClasses}>
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
                    smartBike-Resale
                </h2>

                {/* Display messages */}
                {message && (
                    <p className={
                        message.includes('successful') || message.includes('verified') ?
                        successMessageClasses : errorMessageClasses
                    }>
                        {message}
                    </p>
                )}

                {/* Conditional rendering of forms */}
                {currentForm === 'register' && (
                    <>
                        <h3 className="text-2xl font-semibold text-center mb-6 text-gray-700">Register</h3>
                        <form onSubmit={handleRegisterSubmit}>
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Full Name"
                                value={registerFormData.fullName}
                                onChange={handleRegisterChange}
                                className={inputClasses}
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={registerFormData.email}
                                onChange={handleRegisterChange}
                                className={inputClasses}
                                required
                            />
                            <input
                                type="text"
                                name="address"
                                placeholder="Address"
                                value={registerFormData.address}
                                onChange={handleRegisterChange}
                                className={inputClasses}
                                required
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={registerFormData.password}
                                onChange={handleRegisterChange}
                                className={inputClasses}
                                required
                            />
                            <button
                                type="submit"
                                className={`${buttonClasses} bg-green-600 hover:bg-green-700`}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Registering...' : 'Register'}
                            </button>
                        </form>
                        <p className="text-center text-sm text-gray-600 mt-4">
                            Already have an account?{' '}
                            <button
                                onClick={() => { setCurrentForm('login'); setMessage(''); }}
                                className="text-orange-500 hover:underline font-medium"
                            >
                                Login
                            </button>
                        </p>
                    </>
                )}

                {currentForm === 'otp' && (
                    <>
                        <h3 className="text-2xl font-semibold text-center mb-6 text-gray-700">Verify OTP</h3>
                        <p className="text-center text-gray-600 mb-4">
                            An OTP has been sent to your email. Please enter it below.
                        </p>
                        <form onSubmit={handleVerifyOtp}>
                            <input
                                type="text"
                                name="otp"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={handleOtpChange}
                                className={inputClasses}
                                required
                            />
                            <button
                                type="submit"
                                className={`${buttonClasses} bg-orange-600 hover:bg-orange-700`}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </form>
                        <p className="text-center text-sm text-gray-600 mt-4">
                            Go back to{' '}
                            <button
                                onClick={() => { setCurrentForm('login'); setMessage(''); }}
                                className="text-green-500 hover:underline font-medium"
                            >
                                Login
                            </button>
                        </p>
                    </>
                )}

                {currentForm === 'login' && (
                    <>
                        <h3 className="text-2xl font-semibold text-center mb-6 text-gray-700">Login</h3>
                        <form onSubmit={handleLoginSubmit}>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={loginFormData.email}
                                onChange={handleLoginChange}
                                className={inputClasses}
                                required
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={loginFormData.password}
                                onChange={handleLoginChange}
                                className={inputClasses}
                                required
                            />
                            <button
                                type="submit"
                                className={`${buttonClasses} bg-purple-600 hover:bg-purple-700`}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Logging In...' : 'Login'}
                            </button>
                        </form>
                        <p className="text-center text-sm text-gray-600 mt-4">
                            <button
                                onClick={() => { setCurrentForm('forgotPasswordEmailEntry'); setMessage(''); setForgotPasswordEmail(''); }}
                                className="text-purple-500 hover:underline font-medium mr-2"
                            >
                                Forgot Password?
                            </button>
                            Don't have an account?{' '}
                            <button
                                onClick={() => { setCurrentForm('register'); setMessage(''); }}
                                className="text-orange-500 hover:underline font-medium"
                            >
                                Register
                            </button>
                        </p>
                    </>
                )}

                {currentForm === 'forgotPasswordEmailEntry' && (
                    <>
                        <h3 className="text-2xl font-semibold text-center mb-6 text-gray-700">Forgot Password</h3>
                        <p className="text-center text-gray-600 mb-4">
                            Enter your email to receive an OTP for password reset.
                        </p>
                        <form onSubmit={handleForgotPasswordRequest}>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={forgotPasswordEmail}
                                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                className={inputClasses}
                                required
                            />
                            <button
                                type="submit"
                                className={`${buttonClasses} bg-orange-600 hover:bg-orange-700`}
                                disabled={isForgotPasswordLoading}
                            >
                                {isForgotPasswordLoading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                        <p className="text-center text-sm text-gray-600 mt-4">
                            Go back to{' '}
                            <button
                                onClick={() => { setCurrentForm('login'); setMessage(''); }}
                                className="text-green-500 hover:underline font-medium"
                            >
                                Login
                            </button>
                        </p>
                    </>
                )}

                {currentForm === 'forgotPasswordOtpEntry' && (
                    <>
                        <h3 className="text-2xl font-semibold text-center mb-6 text-gray-700">Reset Password</h3>
                        <p className="text-center text-gray-600 mb-4">
                            An OTP has been sent to your email. Enter it below with your new password.
                        </p>
                        <form onSubmit={handleResetPassword}>
                            <input
                                type="text"
                                name="otp"
                                placeholder="Enter OTP"
                                value={forgotPasswordOtp}
                                onChange={handleOtpChange}
                                className={inputClasses}
                                required
                            />
                            <input
                                type="password"
                                name="newPassword"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={handleNewPasswordChange}
                                className={inputClasses}
                                required
                            />
                            <button
                                type="submit"
                                className={`${buttonClasses} bg-purple-600 hover:bg-purple-700`}
                                disabled={isForgotPasswordLoading}
                            >
                                {isForgotPasswordLoading ? 'Resetting Password...' : 'Verify OTP & Reset Password'}
                            </button>
                        </form>
                        <p className="text-center text-sm text-gray-600 mt-4">
                            Go back to{' '}
                            <button
                                onClick={() => { setCurrentForm('login'); setMessage(''); }}
                                className="text-green-500 hover:underline font-medium"
                            >
                                Login
                            </button>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
