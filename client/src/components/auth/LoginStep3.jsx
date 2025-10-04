import React, { useState, useEffect } from 'react';
import Button from '../common/Button.jsx';

const LoginStep3 = ({ userData, method, maskedContact, onVerify, onBack, onResend, isLoading }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Show loading state if required data is not available yet
  if (!userData || !method || !maskedContact) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Loading...
          </h2>
          <p className="text-gray-600">
            Please wait while we prepare your verification code.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    
    onVerify(otp);
  };

  const handleResend = () => {
    setTimeLeft(60);
    setCanResend(false);
    setOtp('');
    setError('');
    onResend();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Enter Verification Code
        </h2>
        <p className="text-gray-600">
          We sent a 6-digit code to {maskedContact}
        </p>
      </div>

      {/* OTP Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP Input */}
        <div className="space-y-1">
          <div className="relative">
            <input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={handleOtpChange}
              className="w-full px-4 py-3 text-gray-500 text-center text-2xl font-mono border border-gray-300 rounded-lg outline-purple-500 tracking-widest"
              maxLength={6}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </div>

        {/* Timer and Resend */}
        <div className="text-center">
          {!canResend ? (
            <p className="text-sm text-gray-500">
              Resend code in {timeLeft}s
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium cursor-pointer"
              disabled={isLoading}
            >
              Resend code
            </button>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg"
          loading={isLoading}
          disabled={isLoading || otp.length !== 6}
        >
          Verify Code →
        </Button>
      </form>

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

export default LoginStep3;
