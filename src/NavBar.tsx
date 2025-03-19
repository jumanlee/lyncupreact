import { Link, Outlet, useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "./App";

const NavBar: React.FC = () => {
  //hook state for account accordion
  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false);

  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  //while rendering, React notices the ref={} in the div and thinks: oh i need to store a reference to this <div> inside dropdownRef.current. After the component finishes rendering, React automatically updates dropdownRef.current to point to the real <div> in the DOM or holds a ref (pointer) to that div element. dropdownRef.current starts as null then React updates it with the actual <div> after having seen the ref={} in the div.
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  //don't get confused: though related, useCallback is not 100% the same as a regular javascript callback function! useCallback is a react hook that memoises a function, preventing it from being created again on every render unless its dependencies change. In this case it's used to prevent unnecessary function re-creation on every render. Cuz there are no changing dependencies e.g. [], the function is created once when the component mounts and never changes or gets re-created on re-renders. React always reuses the same function reference unless the component unmounts
  const handleClickOutside = useCallback((event: MouseEvent) => {
    //In Typescript, event.target has a general type of EventTarget, every clickable item is an event.target, but contains() expects a Node, Node is the base interface for DOM elements like div, button, and since all clickable elements are Nodes, we assert it with as Node, this means when we're not clicking on the dropdown menu, we close it.
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsAccountOpen(false);
    }
  }, []);

  //function to log out
  const logout = () => {
    //remove all the tokens from browser
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    //also remove the user id
    localStorage.removeItem("user_id");
    setIsAuthenticated(false);

    navigate("/");
  };

  //event listener for when mouse clicks outside the dropdown menu, the dropdown menu closes

  useEffect(() => {
    //Only mount event listener if account is open, so that we don't unnecessarily listens when there's no need to.
    if (isAccountOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    //cleanup function to remove listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAccountOpen, handleClickOutside]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
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
              to="/"
              className="hover:opacity-80 text-gray-400 font-semibold "
            >
              Chat
            </Link>
            <Link
              to="/"
              className="hover:opacity-80 text-gray-400 font-semibold "
            >
              Friends
            </Link>
            <Link
              to="/"
              className="hover:opacity-80 text-gray-400 font-semibold "
            >
              Messages
            </Link>

            {/* Account has dropdown accordion  */}
            <div className="relative" ref={dropdownRef}>
              <button
                className="hover:opacity-80 focus:outline-none text-gray-400 font-semibold"
                onClick={() => setIsAccountOpen(!isAccountOpen)}
              >
                Account
              </button>

              {isAccountOpen ? (
                //ref={dropdownRef} tells React to assign a reference to the <div> after the component renders. dropdownRef.current is updated automatically by React after the component has mounted, ref expects a ref object (dropdownRef), not its .current property, this caused me problems!
                <div className="absolute right-0 mt-2 w-36 bg-gray-800 text-gray-200 shadow-md rounded min-w-max overflow-hidden whitespace-nowrap">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-gray-700"
                    onClick={() => setIsAccountOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 hover:bg-gray-700"
                    onClick={() => setIsAccountOpen(false)}
                  >
                    Settings
                  </Link>
                  {/* use <button> here because I need action like onClick */}
                  <button
                    onClick={() => {
                      logout();
                      setIsAccountOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </nav>

      {/* The main app */}
      {/* outlet is a placeholder for where the nested child routes is rendered */}
      <main className="flex-grow">
        {/* the child routes render here */}
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-gray-400 font-semibold p-4 text-center mt-auto">
        © 2025 LyncUp. All rights reserved.
      </footer>
    </div>
  );
};

export default NavBar;
