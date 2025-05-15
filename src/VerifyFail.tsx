import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosPublicInstance from "./axiomPublic";

const VerifyFail: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setFeedback(null);
    if (!email) {
      setFeedback("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axiosPublicInstance.post(
        "users/resend-verification/",
        { email }
      );
      //"Verification email resent."
      setFeedback(data.detail);
    } catch (err: any) {
      //err.response.data.detail comes from your DRF view
      const msg = err.response?.data?.detail || "Failed to send. Try again.";
      setFeedback(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-200 min-h-screen flex items-center justify-center text-gray-700">
      <div className="max-w-md w-full mx-4 text-center bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Failed to Verify Email!
        </h1>
        <p className="mb-6 text-lg">
          Unfortunately, we were unable to verify your email address. Please
          check the link you received in your email or try again below:
        </p>

        <div className="flex flex-col items-center justify-center space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
          />

          <button
            onClick={handleResend}
            disabled={loading}
            className="bg-gray-900 hover:bg-gray-800 text-gray-200 font-semibold py-2 px-4 rounded-2xl disabled:opacity-50"
          >
            {loading ? "Sending..." : "Re-send Email"}
          </button>

          {feedback && (
            <p className="mt-2 text-sm text-center text-red-600">{feedback}</p>
          )}

          <button
            onClick={() => navigate("/")}
            className="text-gray-900 font-semibold hover:underline"
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyFail;
