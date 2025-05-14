import React from "react";
import { useNavigate } from "react-router-dom";

const VerifyFail: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-200 min-h-screen flex items-center justify-center text-gray-700">
      <div className="max-w-md w-full mx-4 text-center bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Failed to Verify Email!
        </h1>
        <p className="mb-6 text-lg">
          Unfortunately, we were unable to verify your email address. Please
          check the link you received in your email or try again with the re-send
          verification link.
        </p>
        <div className="flex flex-col items-center justify-center space-y-4">
        <button
          onClick={() => navigate("/")}
          className="bg-gray-900 hover:bg-gray-800 text-gray-200 font-semibold py-2 px-5 rounded-2xl"
        >
          Re-send Email
        </button>
        <button
          onClick={() => navigate("/")}
          className="bg-gray-900 hover:bg-gray-800 text-gray-200 font-semibold py-2 px-5 rounded-2xl"
        >
          Back
        </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyFail;
