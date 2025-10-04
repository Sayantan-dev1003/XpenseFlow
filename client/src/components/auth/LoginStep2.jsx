import React from 'react';

const LoginStep2 = ({ userData, onMethodSelect, onBack, isLoading }) => {
  const handleMethodSelect = (method) => {
    onMethodSelect(method);
  };

  // Show loading state if userData is not available yet
  if (!userData) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Loading...
          </h2>
          <p className="text-gray-600">
            Please wait while we prepare your verification options.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Verification Method
        </h2>
        <p className="text-gray-600">
          How would you like to receive your verification code?
        </p>
      </div>

      {/* Method Selection */}
      <div className="space-y-4">
        {userData.hasEmail && (
          <button
            type="button"
            className="w-full p-4 bg-purple-50 border border-purple-200 rounded-lg text-left hover:bg-purple-100 hover:border-purple-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleMethodSelect('email')}
            disabled={isLoading}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
              <div className="flex-grow">
                <div className="font-semibold text-gray-900 mb-1">Email</div>
                <div className="text-sm text-gray-600">
                  Send code to {userData.email ? `${userData.email.substring(0, 3)}***@${userData.email.split('@')[1]}` : 'your email'}
                </div>
              </div>
            </div>
          </button>
        )}

        {userData.hasPhone && (
          <button
            type="button"
            className="w-full p-4 bg-purple-50 border border-purple-200 rounded-lg text-left hover:bg-purple-100 hover:border-purple-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleMethodSelect('phone')}
            disabled={isLoading}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
              <div className="flex-grow">
                <div className="font-semibold text-gray-900 mb-1">SMS</div>
                <div className="text-sm text-gray-600">
                  Send code to {userData.phoneNumber ? `${userData.phoneNumber.substring(0, 3)}***${userData.phoneNumber.substring(userData.phoneNumber.length - 3)}` : 'your phone'}
                </div>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Back Button */}
      <div className="text-center">
        <button
          type="button"
          onClick={onBack}
          className="text-purple-600 hover:text-purple-700 font-medium text-sm"
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
};

export default LoginStep2;