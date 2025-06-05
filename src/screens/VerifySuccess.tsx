import React from "react";
import { useNavigate } from "react-router-dom";

const VerifySuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-200 min-h-screen flex items-center justify-center text-gray-700">
      <div className="max-w-md w-full mx-4 text-center bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Email Verification Successful
        </h1>
        <p className="mb-6 text-lg">
          Thank you! Your email has been successfully verified.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-gray-900 hover:bg-gray-800 text-gray-200 font-semibold py-3 px-6 rounded-2xl"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default VerifySuccess;
