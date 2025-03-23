import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import axiosInstance from "./axiom";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { useAuth } from "./App";

//css library component from https://tailwindui.com/components/application-ui/forms/sign-in-forms

interface RegisterData {
  email: string;
  username: string;
  password: string;
  password2: string;
  firstname: string;
  lastname: string;
}

const Register: React.FC = () => {
  const [registerData, setRegisterData] = useState<RegisterData>({
    email: "",
    username: "",
    password: "",
    password2: "",
    firstname: "",
    lastname: "",
  });

  const navigate = useNavigate();

  const handleRegisterChange = (e: ChangeEvent<HTMLInputElement>) => {
    //e.target is the input element. name is attribute of html.
    const { name, value } = e.target;
    setRegisterData({ ...registerData, [name]: value });
  };

  //unlike ChangeEvent, often don't need to specify a type parameter with FormEvent when it's used with form submission because form submissions are generally handled at the form level, not on individual elements within the form.
  const handleRegisterSubmit = (event: React.FormEvent) => {
    //prevent default refresh
    event.preventDefault();

    //double check passwords
    if (registerData.password !== registerData.password2) {
        alert("Passwords do not match");
        return;
      }
      
    axiosInstance
      .post("users/register/", registerData)
      .then((response) => {
        console.log(response);
        alert("Register successful! Please log in with your credentials.");
        navigate("/");
      })
      .catch((error) => {
        console.error(error);
        alert("Registration failed. Please try again");
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg mx-auto bg-gray-800 text-gray-200 p-6 rounded shadow-md">
        <h2 className="text-2xl text-gray-400 font-semibold mb-6 text-center">
          Register a LyncUp account
        </h2>
        <form onSubmit={handleRegisterSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block mb-1 text-gray-400 font-semibold"
            >
              Email:
            </label>
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="off"
              value={registerData.email}
              onChange={handleRegisterChange}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 
                           focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block mb-1 text-gray-400 font-semibold"
            >
              Username:
            </label>
            <input
              id="username"
              type="text"
              name="username"
              autoComplete="off"
              value={registerData.username}
              onChange={handleRegisterChange}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 
                           focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="firstname"
              className="block mb-1 text-gray-400 font-semibold"
            >
              First Name:
            </label>
            <input
              id="firstname"
              type="text"
              name="firstname"
              autoComplete="off"
              value={registerData.firstname}
              onChange={handleRegisterChange}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 
                           focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="lastname"
              className="block mb-1 text-gray-400 font-semibold"
            >
              Last Name:
            </label>
            <input
              id="lastname"
              type="text"
              name="lastname"
              autoComplete="off"
              value={registerData.lastname}
              onChange={handleRegisterChange}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 
                           focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block mb-1 text-gray-400 font-semibold"
            >
              Password:
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={registerData.password}
              onChange={handleRegisterChange}
              autoComplete="new-password"
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password2"
              className="block mb-1 text-gray-400 font-semibold"
            >
              Confirm Password:
            </label>
            <input
              id="password2"
              type="password"
              name="password2"
              autoComplete="new-password"
              value={registerData.password2}
              onChange={handleRegisterChange}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
        
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-[#4b1e1e] text-gray-200 font-semibold py-2 px-4 rounded focus:outline-none"
            >
              Register
            </button>
          </div>
        </form>
        <div className="mt-5 flex items-center justify-center">
          <button onClick={() => navigate("/")}>
            <span className="text-gray-400 text-sm font-semibold">
              Back to login.
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
