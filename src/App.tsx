import React, { createContext, useContext, useState, useEffect } from "react";
import AuthForm from "./Auth";
import ChatRoom from "./ChatRoom";
import Queue from "./Queue";
import { Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./NavBar";
import Profile from "./Profile";
import Register from "./Register";
import AboutUs from "./AboutUs";
import VerifySuccess from "./VerifySuccess";
import VerifyFail from "./VerifyFail";
import ResetPassword from "./ResetPassword";
import SendPasswordReset from "./SendPasswordReset";
import ChangePasswordAuthenticated from "./ChangePasswordAuthenticated";
import SendPasswordResetAuthenticated from "./SendPasswordResetAuthenticated";
import axiosInstance from "./axiom";

//Note: all code is formatted with Prettier extension

//because we need the child components need access to authenticated state for navgation, it's better to use useContext!

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
        // Then, when validateToken function runs (now commented out, but previously was in use!), it fails the API check and sets isAuthenticated to false: But then because we have an expired token, there is a token in storage, so we keep executing validateToken, which causes repeated execution of validateToken!:
        // const validateToken = async () => {
        //     const token = localStorage.getItem("access_token");
        //     if (!token) {
        //Therefore it's important we must remove the expired tokens!
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setIsAuthenticated(false);
      });
  };

  //when we refresh a page from the browser, the whole reactapp gets loaded again, therefore in this case useEffect does get executed again. This is different from just navigating from page to page, which doesn't trigger this useEffect again!
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

//PublicRoute: when user is authenticated, they will be directed to /aboutus, otherwise they will be prompted to login
const PublicRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/aboutus" replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="bg-white min-h-screen w-full">
        <Routes>
          {/* public route */}
          {/* If unauthenticated, show the login page or another child, or if authenticated e.g. there's a token, then just navigate to the queue page */}
          {/* can't do route children nesting here like in auth route because <AuthRoute> wrapper is around a layout component (<Navbar/>) that itself renders an <Outlet/>, React-Router knows where to drop all those nested child routes. <PublicRoute> by contrast just returns a single component (e.g <AuthForm/>) or a <Navigate/> so it doesn’t render an <Outlet/>, so there’s nowhere for any nested <Route> to mount */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <AuthForm />
              </PublicRoute>
            }
          />

          {/* public one off pages */}
          <Route
            path="/verify-success"
            element={
              <PublicRoute>
                <VerifySuccess />
              </PublicRoute>
            }
          />
          <Route
            path="/verify-fail"
            element={
              <PublicRoute>
                <VerifyFail />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/send-password-reset"
            element={
              <PublicRoute>
                <SendPasswordReset />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password/:uidb64/:token"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />

          {/* authenticated route */}
          {/* For authenticated users. This set is only reached if the route path matches /chat, /queue etc, as defined below, which the PublicRoute component only redirects when authenticated. */}
          {/* chatroom should not have navbar */}
          <Route
            path="/chat"
            element={
              <AuthRoute>
                <ChatRoom />
              </AuthRoute>
            }
          />
          <Route
            element={
              <AuthRoute>
                <Navbar />
              </AuthRoute>
            }
          >
            {/*children are RELATIVE, so they render in <Outlet/> as defined in NavBar.tsx*/}
            {/* <Route path="chat" element={<ChatRoom />} /> */}
            <Route path="queue" element={<Queue />} />
            <Route path="profile" element={<Profile />} />
            <Route path="aboutus" element={<AboutUs />} />
            <Route
              path="change-password-authenticated"
              element={<ChangePasswordAuthenticated />}
            />
            <Route
              path="send-password-reset-authenticated"
              element={<SendPasswordResetAuthenticated />}
            />
          </Route>

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App;
