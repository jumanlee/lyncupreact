import React, { createContext, useContext, useState, useEffect } from "react";
// import logo from './logo.svg';
// import './App.css';
import AuthForm from "./Auth";
import ChatRoom from "./ChatRoom";
import Queue from "./Queue";
import { Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./NavBar";
import Profile from "./Profile";
import axiosInstance from "./axiom";

//Note: all pages are formatted with Prettier extension

//because we need the child components need access to authenticated state for navgation, iot's better to use useContext!

//first define the context value type, the type of he value being passed/accessed via context
interface AuthContextType {
  isAuthenticated: boolean;
  //void because the function doesn't return anything, its just to set the state
  setIsAuthenticated: (value: boolean) => void;
}

//this is the context container
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be inside AuthProvider!");
  }
  return context;
};

//this is Provider which actually stores the value to be passed, inside it is where AuthContext is used
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    Boolean(localStorage.getItem("access_token"))
  ); //if no token, it returns false, and we make sure its boolean.

  //function to check if the access is valid
  const validateToken = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    //this section is for checking if the token actually is still valid by calling some api, if not then isAuthenticated is set to false

    axiosInstance
      .get("/users/testapi/")
      .then(() => {
        console.log("validateToken() successful");
        setIsAuthenticated(true);
      })
      .catch(() => {
        console.log("validateToken() failed");

        //removeItem here is important! without it, this gave me problems when the token is already expired, as we initialise  const [isAuthenticated, setIsAuthenticated] = useState<boolean>( Boolean(localStorage.getItem("access_token")). 
        // Then, when validateToken function runs, it fails the API check and sets isAuthenticated to false. This state “flip‐flop” between true (from the expired token) and false (after the check) can lead to a redirect loop.
        localStorage.removeItem("access_token");
        setIsAuthenticated(false);
      });
  };

  useEffect(() => {
    validateToken();

    //we need this to wrap around validateToken() as a callback function for event listener, we can't wrap validateToken with an anonymous function! see React notes!
    const handleTokenChange = () => {
      validateToken();
    };

    //IMPORTANT: the storage event listener does NOT detect localstorage changes in the same browser tab. It only detects changes when localstorage is modified in another tab or window. Therefore, we still need to manually update the auth state using setIsAuthenticated in login and logout functions inside other components but this listeners are still useful for detecting authentication changes across tabs. For example if a user logs out in one tab, the listener in another open tab will update that tab's state automatically.
    window.addEventListener("storage", handleTokenChange);

    //cleanup
    return () => window.removeEventListener("storage", handleTokenChange);

    //don't need dependency cuz we only need this event listener to be mounted once.
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

//AuthRoute for only authenticated users
const AuthRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  //Navigate prop: to="/" means to redirect to / route, "replace" means we're telling the React Router it replaces the current URL in the history, it also prevents user from going back! The preventing bit is crucial!
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

//PublicRoute: when user is authenticated, they will be directed to /queue, otherwise they will be prompted to login
const PublicRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <AuthForm /> : <Navigate to="/queue" replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="bg-white min-h-screen w-full">
        <Routes>
          {/* If unauthenticated, show the login page, or if authenticated e.g. there's a token, then just navigate to the queue page */}
          <Route path="/" element={<PublicRoute />} />

          {/* For authenticated users */}
          <Route path="/" element={<Navbar />}>
            <Route
              path="/chat"
              element={
                <AuthRoute>
                  <ChatRoom />
                </AuthRoute>
              }
            />
            <Route
              path="/queue"
              element={
                <AuthRoute>
                  <Queue />
                </AuthRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <AuthRoute>
                  <Profile />
                </AuthRoute>
              }
            />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App;
