import React, { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import axiosPublicInstance from "./axiomPublic";

interface RegisterData {
  email: string;
  username: string;
  password: string;
  password2: string;
  firstname: string;
  lastname: string;
}

const Register: React.FC = () => {
  const navigate   = useNavigate();
  const [registerData, setRegisterData] = useState<RegisterData>({
    email: "",
    username: "",
    password: "",
    password2: "",
    firstname: "",
    lastname: "",
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleRegisterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (registerData.password !== registerData.password2) {
      setFeedback("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await axiosPublicInstance.post("users/register/", registerData);
      alert("Register successful! Check your inbox to verify your email.");
      navigate("/");               // back to login
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        "Registration failed. Please check your details and try again.";
      setFeedback(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-200 min-h-screen flex items-center justify-center text-gray-700">
      <div className="max-w-md w-full mx-4 bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Create your LyncUp account
        </h2>

        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          {/* email */}
          <div>
            <label htmlFor="email" className="block mb-1 font-semibold">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="off"
              value={registerData.email}
              onChange={handleRegisterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
            />
          </div>

          {/* username */}
          <div>
            <label htmlFor="username" className="block mb-1 font-semibold">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="off"
              value={registerData.username}
              onChange={handleRegisterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
            />
          </div>

          {/* first / last name side-by-side */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="firstname" className="block mb-1 font-semibold">
                First name
              </label>
              <input
                id="firstname"
                name="firstname"
                type="text"
                autoComplete="off"
                value={registerData.firstname}
                onChange={handleRegisterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="lastname" className="block mb-1 font-semibold">
                Last name
              </label>
              <input
                id="lastname"
                name="lastname"
                type="text"
                autoComplete="off"
                value={registerData.lastname}
                onChange={handleRegisterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          {/* passwords */}
          <div>
            <label htmlFor="password" className="block mb-1 font-semibold">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={registerData.password}
              onChange={handleRegisterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password2" className="block mb-1 font-semibold">
              Confirm password
            </label>
            <input
              id="password2"
              name="password2"
              type="password"
              autoComplete="new-password"
              value={registerData.password2}
              onChange={handleRegisterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
            />
          </div>

          {feedback && (
            <p className="text-sm text-red-600 text-center">{feedback}</p>
          )}

          {/* submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-gray-200 font-semibold py-2 rounded-2xl disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* back link */}
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

export default Register;
