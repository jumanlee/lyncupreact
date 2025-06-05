import React, { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import axiosPublicInstance from "../axiomPublic";

const SendPasswordReset: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!email) {
      setFeedback("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axiosPublicInstance.post(
        "users/send-password-reset/",
        { email }
      );
      setFeedback(data.detail || "If your email is registered, you'll receive a reset link.");
    } catch (err: any) {
      const resp = err.response?.data;
      setFeedback(
        resp?.detail ||
          "Something went wrong. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-200 min-h-screen flex items-center justify-center text-gray-700">
      <div className="max-w-md w-full mx-4 bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Forgot Your Password?
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-1 font-semibold">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="off"
              value={email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
            />
          </div>

          {feedback && (
            <p className="text-sm text-red-600 whitespace-pre-line text-center">
              {feedback}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-gray-200 font-semibold py-2 rounded-2xl disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
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

export default SendPasswordReset;
