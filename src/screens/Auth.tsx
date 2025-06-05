import React, { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiom";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { useAuth } from "../App";

interface LoginData {
  email: string;
  password: string;
}

const AuthForm: React.FC = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleLoginChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    //clear message while typing
    setFeedback(null);              
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const resp = await axiosInstance.post("token/", loginData);

      localStorage.setItem("access_token", resp.data.access);
      localStorage.setItem("refresh_token", resp.data.refresh);
      setIsAuthenticated(true);

      interface CustomJwt extends JwtPayload {
        user_id: number;
      }
      const decoded = jwtDecode<CustomJwt>(resp.data.access);
      localStorage.setItem("user_id", decoded.user_id.toString());

      navigate("/queue");
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        "The email and/or password are wrong. Please try again.";
      setFeedback(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-200 min-h-screen flex items-center justify-center text-gray-700">
      <div className="max-w-md w-full mx-4 bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Welcome to LyncUp!
        </h2>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
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
              value={loginData.email}
              onChange={handleLoginChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
            />
          </div>

          {/* password */}
          <div>
            <label htmlFor="password" className="block mb-1 font-semibold">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={loginData.password}
              onChange={handleLoginChange}
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
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/register")}
            className="text-gray-900 font-semibold hover:underline"
          >
            Don't have an account? Register now!
          </button>
          <button
            onClick={() => navigate("/send-password-reset")}
            className="text-gray-900 font-semibold hover:underline"
          >
            Forgot your password?
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
