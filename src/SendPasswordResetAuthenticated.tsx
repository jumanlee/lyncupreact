import React, { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import axiosPublicInstance from "./axiomPublic";
import { useAuth } from "./App";

//password reset page for logged in users
const SendPasswordResetAuthenticated: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { setIsAuthenticated } = useAuth();

  //function to log out but doesn't redirect to login page, will refactor later
  const logout = () => {
    alert(
      "We've sent a password reset link to your email. Please log in again with your new password."
    );
    //remove all the tokens from browser
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    //also remove the user id
    localStorage.removeItem("user_id");
    setIsAuthenticated(false);
    navigate("/")
  };

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
       await axiosPublicInstance.post(
        "users/send-password-reset/",
        { email }
      );
      alert(
        "We've sent a password reset link to your email. Please log in again with your new password."
      );
      logout();
    } catch (err: any) {
      const resp = err.response?.data;
      setFeedback(
        resp?.detail || "Something went wrong. Please try again later."
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
              placeholder="Confirm your email"
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
      </div>
    </div>
  );
};

export default SendPasswordResetAuthenticated;
