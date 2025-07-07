// LoginWithGoogle.jsx
import React from "react";
import { FcGoogle } from "react-icons/fc";

function LoginWithGoogle() {
  const handleLogin = () => {
    window.location.href = "http://localhost:9000/api/google/auth";
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-12">
          Welcome to Your App
        </h1>

        <button
          onClick={handleLogin}
          className="group relative w-24 h-24 rounded-full bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 focus:outline-none"
          aria-label="Sign in with Google"
        >
          {/* Google logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <FcGoogle className="text-3xl" />
          </div>

          {/* Animated ring on hover */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-blue-200 group-hover:animate-pulse transition-all duration-300"></div>

          {/* Tooltip text (appears on hover) */}
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-sm font-medium text-gray-600">
            Sign in with Google
          </div>
        </button>

        <p className="mt-16 text-gray-500">Click the Google icon to begin</p>
      </div>
    </div>
  );
}

export default LoginWithGoogle;
