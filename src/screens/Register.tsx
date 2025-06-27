import React, { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import axiosPublicInstance from "../axiomPublic";

interface RegisterData {
  email: string;
  username: string;
  password: string;
  password2: string;
  firstname: string;
  lastname: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterData>({
    email: "",
    username: "",
    password: "",
    password2: "",
    firstname: "",
    lastname: "",
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (form.password !== form.password2) {
      setFeedback("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axiosPublicInstance.post(
        "users/register/",
        form
      );

      //brand-new user: no data.code
      if (!data.code) {
        alert(data.detail || "A verification link has been sent to your email! Please click the link to complete registration.");
        navigate("/");
        return;
      }

      //existed but unverified: backend already resent
      if (data.code === "verification_resent") {
        setFeedback(data.detail);
        return;
      }

    } catch (err: any) {
      const resp = err.response?.data;
      console.log("resp");
      console.log(resp);
      setFeedback(
        //built in django password validation error returns "password" key, not detail. So we need another condition resp.password
        resp?.detail || (Array.isArray(resp?.password) ? resp.password.join("\n") : resp?.password) ||
          "Registration failed. Please check your details and try again."
      );
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block mb-1 font-semibold">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="off"
              value={form.email}
              onChange={handleChange}
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
              value={form.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
            />
          </div>

          {/* first and last names */}
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
                value={form.firstname}
                onChange={handleChange}
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
                value={form.lastname}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              />
            </div>
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
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
            />
          </div>

          {/* confirm password */}
          <div>
            <label htmlFor="password2" className="block mb-1 font-semibold">
              Confirm password
            </label>
            <input
              id="password2"
              name="password2"
              type="password"
              autoComplete="new-password"
              value={form.password2}
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

          {/* register */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-gray-200 font-semibold py-2 rounded-2xl disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
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

export default Register;
