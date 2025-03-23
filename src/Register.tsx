import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import axiosInstance from "./axiom";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { useAuth } from "./App";

//css library component from https://tailwindui.com/components/application-ui/forms/sign-in-forms

interface LoginData {
  email: string;
  password: string;
}

const Register: React.FC = () => {
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });

  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLoginChange = (e: ChangeEvent<HTMLInputElement>) => {
    //e.target is the input element. name is attribute of html.
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  //unlike ChangeEvent, often don't need to specify a type parameter with FormEvent when it's used with form submission because form submissions are generally handled at the form level, not on individual elements within the form.
  const handleLoginSubmit = async (event: React.FormEvent) => {
    //prevent default refresh
    event.preventDefault();

    try {
      const response = await axiosInstance.post("token/", loginData);
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      setIsAuthenticated(true);

      //define the payload type
      interface CustomJwtPayLoad extends JwtPayload {
        user_id: number;
      }

      //save the user id in local storage
      try {
        const decoded_token = jwtDecode<CustomJwtPayLoad>(response.data.access);
        localStorage.setItem("user_id", decoded_token.user_id.toString());
      } catch (error) {
        console.error(error);
        console.log("Failed to save user id in local storage");
      }

      navigate("/queue");
    } catch (error) {
      console.error(error);
      alert("The email and or password are wrong! Please try again!");
    }
  };

  // const logout = () => {
  //   //remove all the tokens from browser
  //   localStorage.removeItem("access_token");
  //   localStorage.removeItem("refresh_token");
  //   //also remove the user id
  //   localStorage.removeItem("user_id");
  //   setIsLoggedIn(false);
  //   setLoginData({
  //     email: "",
  //     password: "",
  //   });
  // };

  //useEffect to check if the user is already logged in or not. If already logged in, it the page will display "welcome to LyncUp" otherwise, it will show the form required to log in. Remember, I'm using dummy tokens here.
  useEffect(() => {
    // const accessToken = localStorage.getItem("access_token");
    // if (accessToken) {
    //   setIsLoggedIn(true);
    // }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg mx-auto bg-gray-800 text-gray-200 p-6 rounded shadow-md">
        <h2 className="text-2xl text-gray-400 font-semibold mb-6 text-center">
          Register a LyncUp account
        </h2>
        <form onSubmit={handleLoginSubmit}>
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
              value={loginData.email}
              onChange={handleLoginChange}
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
              value={loginData.password}
              onChange={handleLoginChange}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-[#4b1e1e] text-gray-200 font-semibold py-2 px-4 rounded focus:outline-none"
            >
              Log In
            </button>
          </div>
        </form>
        <div className="mt-5 flex items-center justify-center">
          <Link to="/">
            <span className="text-gray-400 text-sm font-semibold">
              Don't have an account?
            </span>{" "}
            <span className="text-gray-200 text-sm font-bold">Register now!</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
