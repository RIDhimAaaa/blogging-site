import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EmailVerification = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const { verifyEmail } = useAuth();

  useEffect(() => {
    const verify = async () => {
      if (token) {
        const result = await verifyEmail(token);
        if (result.success) {
          setStatus('success');
          setMessage(result.message);
        } else {
          setStatus('error');
          setMessage(result.message);
        }
      } else {
        setStatus('error');
        setMessage('Invalid verification link');
      }
    };

    verify();
  }, [token, verifyEmail]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F2E0D2' }}>
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-16 h-16 rounded-full" style={{ backgroundColor: '#FFBDC5' }}></div>
        <div className="absolute top-40 right-32 w-20 h-20 rounded-full" style={{ backgroundColor: '#670626' }}></div>
        <div className="absolute bottom-32 left-1/4 w-12 h-12 rounded-full" style={{ backgroundColor: '#FFBDC5' }}></div>
        <div className="absolute bottom-20 right-1/5 w-14 h-14 rounded-full" style={{ backgroundColor: '#670626' }}></div>
      </div>

      <div className="relative flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border-2" style={{ borderColor: '#FFBDC5' }}>
            
            {status === 'verifying' && (
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#670626' }}>
                  <svg className="animate-spin w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#670626' }}>
                  Verifying Your Email
                </h2>
                <p className="text-sm" style={{ color: '#670626' }}>
                  Please wait while we verify your email address...
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#670626' }}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#670626' }}>
                  Email Verified Successfully!
                </h2>
                <div className="rounded-lg p-4 mb-6 border-2" style={{ backgroundColor: '#FFBDC5', borderColor: '#670626' }}>
                  <p className="text-sm" style={{ color: '#670626' }}>
                    {message}
                  </p>
                </div>
                <div className="space-y-4">
                  <Link
                    to="/login"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-white font-semibold hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200 transform hover:scale-105"
                    style={{ 
                      backgroundColor: '#670626',
                      '--tw-ring-color': '#FFBDC5'
                    }}
                  >
                    Sign In to Your Account
                  </Link>
                  <Link
                    to="/"
                    className="w-full flex justify-center py-3 px-4 border-2 rounded-xl font-semibold hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200"
                    style={{ 
                      borderColor: '#670626',
                      color: '#670626',
                      '--tw-ring-color': '#FFBDC5'
                    }}
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#670626' }}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#670626' }}>
                  Verification Failed
                </h2>
                <div className="rounded-lg p-4 mb-6 border-2" style={{ backgroundColor: '#FFBDC5', borderColor: '#670626' }}>
                  <p className="text-sm" style={{ color: '#670626' }}>
                    {message}
                  </p>
                </div>
                <div className="space-y-4">
                  <Link
                    to="/signup"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-white font-semibold hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200 transform hover:scale-105"
                    style={{ 
                      backgroundColor: '#670626',
                      '--tw-ring-color': '#FFBDC5'
                    }}
                  >
                    Sign Up Again
                  </Link>
                  <Link
                    to="/login"
                    className="w-full flex justify-center py-3 px-4 border-2 rounded-xl font-semibold hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200"
                    style={{ 
                      borderColor: '#670626',
                      color: '#670626',
                      '--tw-ring-color': '#FFBDC5'
                    }}
                  >
                    Try to Sign In
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
