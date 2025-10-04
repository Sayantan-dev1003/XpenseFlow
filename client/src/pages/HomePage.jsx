import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button.jsx';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Content (40%) */}
      <div className="w-2/5 flex flex-col justify-center px-8 lg:px-16">
        <div className="max-w-lg">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Secure Authentication
              <br />
            <span className="text-purple-600">Made Simple</span>
            </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Complete authentication system with minimal setup and maximum security.
                Focus on your core business while we handle authentication.
              </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                Get Started Free
          </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-4 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold">
                Sign In
              </Button>
            </Link>
      </div>

          <p className="text-sm text-gray-500">
            Trusted by 10,000+ developers worldwide
          </p>
            </div>
          </div>

      {/* Right Side - Image (60%) */}
      <div className="w-3/5 relative overflow-hidden bg-purple-100/80">
        <img 
          src="/background.png" 
          alt="Authentication Flow Illustration" 
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export default HomePage;