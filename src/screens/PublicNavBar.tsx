import { Link, Outlet, useNavigate } from "react-router-dom";
import React from "react";
// import { useAuth } from "../App";

const PublicNavBar: React.FC = () => {


  // const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navbar that is on every page */}
      <nav className="bg-gray-900 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            to="/"
            className="text-xl text-gray-400 font-semibold hover:opacity-80"
          >
            LyncUp
          </Link>
          <div className="flex space-x-4 items-center">
            <Link
              to="/queue"
              className="hover:opacity-80 text-gray-400 font-semibold "
            >
              Chat
            </Link>
            <Link
              to="/aboutus"
              className="hover:opacity-80 text-gray-400 font-semibold "
            >
              About Us
            </Link>

            {/* Account has dropdown accordion  */}
            <div className="relative" >
              <button
                className="hover:opacity-80 focus:outline-none text-gray-400 font-semibold"
                onClick={() => navigate("/login")}
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* The main app */}
      {/* outlet is a placeholder for where the nested child routes is rendered */}
      {/* flex-min-0 means  want you to grow and take up leftover space (flex-grow), but allow shrinking if needed (min-h-0) */}
      <main className="flex-1 bg-gray-200">
        {/* the child routes render here */}
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-gray-400 font-semibold p-4 text-center mt-auto">
        © 2025 LyncUp. All rights reserved.
      </footer>
    </div>
  );
};

export default PublicNavBar;
