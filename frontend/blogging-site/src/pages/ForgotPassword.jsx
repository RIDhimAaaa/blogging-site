import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { resetPasswordRequest } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    const result = await resetPasswordRequest(email);
    
    if (result.success) {
      setMessage(result.message);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F2E0D2' }}>
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-16 right-16 w-20 h-20 rounded-full" style={{ backgroundColor: '#FFBDC5' }}></div>
        <div className="absolute top-40 left-20 w-14 h-14 rounded-full" style={{ backgroundColor: '#670626' }}></div>
        <div className="absolute bottom-24 right-1/4 w-16 h-16 rounded-full" style={{ backgroundColor: '#FFBDC5' }}></div>
        <div className="absolute bottom-40 left-1/3 w-10 h-10 rounded-full" style={{ backgroundColor: '#670626' }}></div>
      </div>

      <div className="relative flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#670626' }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold" style={{ color: '#670626' }}>
              Forgot Password?
            </h2>
            <p className="mt-2 text-sm" style={{ color: '#670626' }}>
              Enter your email address and we'll send you a reset link
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border-2" style={{ borderColor: '#FFBDC5' }}>
            
            {!message ? (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-lg p-4 border-2" style={{ backgroundColor: '#FFBDC5', borderColor: '#670626', color: '#670626' }}>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: '#670626' }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-4 py-3 border-2 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 transition duration-200"
                      style={{ 
                        borderColor: '#FFBDC5',
                        '--tw-ring-color': '#670626'
                      }}
                      placeholder="Enter your email address"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="w-5 h-5" style={{ color: '#670626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-white font-semibold hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition duration-200 transform hover:scale-105"
                    style={{ 
                      backgroundColor: '#670626',
                      '--tw-ring-color': '#FFBDC5'
                    }}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </div>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-sm" style={{ color: '#670626' }}>
                    Remember your password?{' '}
                    <Link 
                      to="/login" 
                      className="font-semibold hover:underline transition duration-200"
                      style={{ color: '#670626' }}
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#670626' }}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: '#670626' }}>
                  Check Your Email
                </h3>
                <div className="rounded-lg p-4 mb-6 border-2" style={{ backgroundColor: '#FFBDC5', borderColor: '#670626' }}>
                  <p className="text-sm" style={{ color: '#670626' }}>
                    {message}
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-sm" style={{ color: '#670626' }}>
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                  <p className="text-xs" style={{ color: '#670626' }}>
                    Didn't receive the email? Check your spam folder or{' '}
                    <button 
                      onClick={() => {
                        setMessage('');
                        setEmail('');
                      }}
                      className="font-semibold hover:underline"
                      style={{ color: '#670626' }}
                    >
                      try again
                    </button>
                  </p>
                </div>
                <Link
                  to="/login"
                  className="mt-6 w-full flex justify-center py-3 px-4 border-2 rounded-xl font-semibold hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200"
                  style={{ 
                    borderColor: '#670626',
                    color: '#670626',
                    '--tw-ring-color': '#FFBDC5'
                  }}
                >
                  Back to Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
