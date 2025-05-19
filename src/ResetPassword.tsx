import React, { useState, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosPublicInstance from "./axiomPublic";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();

  //useParams is a React Router hook that lets us access url parameters from the current route
  const { uidb64, token } = useParams<{ uidb64: string; token: string }>();

  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "newPassword") setNewPassword(value);
    else if (name === "confirmPassword") setConfirmPassword(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (newPassword !== confirmPassword) {
      setFeedback("Passwords do not match.");
      return;
    }

    if (!uidb64 || !token) {
      setFeedback("Invalid reset link.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = `users/reset-password/${uidb64}/${token}/`;
      const payload = { new_password: newPassword };
      const { data } = await axiosPublicInstance.post(endpoint, payload);

      alert(data.detail || "Your password has been reset. Please log in.");
      navigate("/");
    } catch (err: any) {
      const resp = err.response?.data;

      //django rest framework returns a list of errors for new_password:
    //   {
    //     "detail": [
    //       "This password is too common.",
    //       "This password is too short. It must contain at least 8 characters."
    //     ]
    //   }
      if (resp?.new_password) {
        setFeedback((resp.new_password as string[]).join("\n"));
      } else {
        setFeedback(
          resp?.detail ||
            "Password reset failed. Please check your link and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-200 min-h-screen flex items-center justify-center text-gray-700">
      <div className="max-w-md w-full mx-4 bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Set a New Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New password */}
          <div>
            <label htmlFor="newPassword" className="block mb-1 font-semibold">
              New Password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
            />
          </div>

          {/* Confirm password */}
          <div>
            <label htmlFor="confirmPassword" className="block mb-1 font-semibold">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
            />
          </div>

          {/* feedback */}
          {feedback && (
            <p className="text-sm text-red-600 whitespace-pre-line text-center">
              {feedback}
            </p>
          )}

          {/* submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-gray-200 font-semibold py-2 rounded-2xl disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {/* back to login */}
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

export default ResetPassword;
