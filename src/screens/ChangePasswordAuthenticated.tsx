import React, { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiom";


const ChangePasswordAuthenticated: React.FC = () => {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);



  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === "oldPassword") setOldPassword(value);
    else if (name === "newPassword") setNewPassword(value);
    else if (name === "confirmPassword") setConfirmPassword(value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setFeedback("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback("New password and confirmation do not match.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axiosInstance.post(
        "users/change-password-authenticated/",
        {
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }
      );

      alert(data.detail || "Password updated successfully.");

      //go back to the previous page
      navigate(-1);
    } catch (err: any) {
      const resp = err.response?.data;

      //    possible shapes coming from DRF:
      //      { old_password: ["Old password is incorrect."] }
      //      { new_password: ["This password is too common.", ...] }
      //      { detail: "...some string..." }

      if (resp?.old_password) {
        setFeedback((resp.old_password as string[]).join("\n"));
      } else if (resp?.new_password) {
        setFeedback((resp.new_password as string[]).join("\n"));
      } else if (resp?.confirm_password) {
        setFeedback((resp.confirm_password as string[]).join("\n"));
      } else {
        setFeedback(resp?.detail || "Password change failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-200 min-h-screen flex items-center justify-center text-gray-700">
      <div className="max-w-md w-full mx-4 bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Change Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* old password */}
          <div>
            <label htmlFor="oldPassword" className="block mb-1 font-semibold">
              Current Password
            </label>
            <input
              id="oldPassword"
              name="oldPassword"
              type="password"
              autoComplete="current-password"
              value={oldPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
            />
          </div>

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

          <div>
            <label
              htmlFor="confirmPassword"
              className="block mb-1 font-semibold"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
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
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={() => {navigate("/send-password-reset-authenticated");}}
            className="text-gray-900 font-semibold hover:underline"
          >
            Forgot your password?
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordAuthenticated;
