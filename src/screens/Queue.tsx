import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../axiom"; // Import your Axios instance
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import.meta.env.VITE_DJANGO_URL;

const Queue: React.FC = () => {
  //consider using atob instead of localstorage for token storage, for later development
  const navigate = useNavigate();
  const { setIsAuthenticated, isAuthenticated } = useAuth();

  const websocketRef = useRef<WebSocket | null>(null);
  const isWebSocketInitialised = useRef<boolean>(false);
  const [triggeredEventListener, setTriggeredEventListener] =
    useState<boolean>(false);

  //state to check if the user's profile is already completed.
  const [isProfileCompleted, setIsProfileCompleted] = useState<boolean>(false);

  const getValidAccessToken = async (): Promise<string | null> => {
    let accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    if (!accessToken || !refreshToken) {
      console.error("Access or Refresh token not found in localStorage!");
      return null;
    }

    // Decode token and check expiry
    const tokenParts = JSON.parse(atob(refreshToken.split(".")[1]));
    const now = Math.ceil(Date.now() / 1000);

    if (tokenParts.exp > now) {
      try {
        const response = await axiosInstance.post("/token/refresh/", {
          refresh: refreshToken,
        });
        if (response.data.access) {
          accessToken = response.data.access;
          if (accessToken) {
            localStorage.setItem("access_token", accessToken);
            axiosInstance.defaults.headers[
              "Authorization"
            ] = `Bearer ${accessToken}`;
          }
        }
      } catch (error) {
        console.error("Failed to refresh token:", error);
        // window.location.href = '/login/';
        navigate("/");
        return null;
      }
    }

    return accessToken;
  };

  //function to check how much remaining time the refresh token has. This is important as we should only allow users to queue if the user's refresh token is not due to expire soon, cuz if refresh token is expired, users would be forced to login again, and this could disrupt the chat sessions and the user could be forced to quit and re-login.
  const getRefreshTokenRemainingTime = (): number | null => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return null;

    const tokenParts = refreshToken.split(".");
    if (tokenParts.length !== 3) return null;

    try {
      const payload = JSON.parse(atob(tokenParts[1]));
      //in seconds
      const exp = payload.exp;
      const now = Math.floor(Date.now() / 1000);
      const remaining = exp - now;
      return remaining;
    } catch (error) {
      console.error("failed to decode refresh token", error);
      return null;
    }
  };

  //will refactor this later
  const logout = () => {
    //remove all the tokens from browser
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    //also remove the user id
    localStorage.removeItem("user_id");
    setIsAuthenticated(false);

    // navigate("/");
  };

  useEffect(() => {
    const fetchTokenAndConnectWebSocket = async () => {
      //this conditional checking is necessary because React's Strict Mode causes useEffect to run twice in development, leading to multiple WebSocket connections and duplicated message event listeners. Note that if I refresh the web page, the isWebSocketInitialised.current becomes false.
      if (isWebSocketInitialised.current) return;
      isWebSocketInitialised.current = true;

      try {
        // const token = localStorage.getItem('access_token');
        const token = await getValidAccessToken();

        if (!token) {
          console.error("Token not found in localStorage!");
          return;
        }

        // const url = `ws://${import.meta.env.VITE_DJANGO_URL}/ws/queue/?token=${token}`;
        const url = `${import.meta.env.VITE_WS_URL}/ws/queue/?token=${token}`;
        websocketRef.current = new WebSocket(url);
        // websocketRef.current = websocket;

        websocketRef.current.addEventListener("open", () => {
          console.log("WebSocket connection established");
        });

        websocketRef.current.addEventListener("message", (event) => {
          console.log("Message from server:", event.data);
          const data = JSON.parse(event.data);

          //the double rendering in the console is  caused by React Strict Mode in development. React Strict Mode intentionally renders components twice in development to help identify potential issues like side effects in components or hooks. This double rendering only happens in development mode and does not occur in the production build.

          if (data["room_id"]) {
            // console.log("entered room_id navigate");
            navigate("/chat", { state: { room_id: data["room_id"] } });
          } else {
            console.log("no room_id!");
          }
        });

        websocketRef.current.addEventListener("error", (error) => {
          console.error("WebSocket error:", error);
        });

        websocketRef.current.addEventListener("close", () => {
          console.log("WebSocket connection closed");
        });
      } catch (error) {
        console.error("Failed to validate token or connect WebSocket:", error);
      }
    };

    if (triggeredEventListener) {
      fetchTokenAndConnectWebSocket();
    }

    return () => {
      // websocket.close();
      if (websocketRef.current) {
        websocketRef.current.close();
        console.log("WebSocket closed in cleanup");
      }
    };
  }, [triggeredEventListener]);

  //one-off API call to check if the user's profile is already completed, if not, then redirect to profile edit page.
  useEffect(() => {
    axiosInstance
      .get("users/checkprofilecomplete/")
      .then((response) => {
        setIsProfileCompleted(response.data.profile_complete);
      })
      .catch((error) => {
        console.error("checkprofilecomplete API failed", error);
      });
  }, []);

  return (
    <div className="bg-gray-200 min-h-[calc(100vh-130px)] text-gray-700">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mt-5 px-6 pt-8 pl-8 pt-8 ">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Ready to Connect?
          </h1>

          <p className="mb-4 text-lg">
            Powered by machine learning, LyncUp finds the best possible match
            from other professionals currently in the queue, placing you into a
            private chatroom with 2-3 people who are predicted, based on past
            interactions and preferences, to align with yours.
          </p>
          {isAuthenticated ? (
            <>
              <p className="mb-4 text-lg">
                To get started, make sure your{" "}
                <button
                  onClick={() => navigate("/profile")}
                  className="text-gray-800 hover:text-gray-1000 font-semibold"
                >
                  profile
                </button>{" "}
                is complete, then click below to enter the queue.
              </p>
            </>
          ) : (
            <>
              <p className="mb-4 text-lg">
                Please{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-gray-800 hover:text-gray-1000 font-semibold"
                >
                  log in
                </button>{" "}
                before joining the queue.
              </p>
            </>
          )}
        </div>

        {!triggeredEventListener ? (
          <div className="mt-10">
            <button
              className="bg-gray-900 hover:bg-gray-800 text-gray-200 font-semibold py-3 px-6 rounded"
              onClick={() => {
                if (!isAuthenticated) {
                  alert("You are not logged in! Please login!");
                  navigate("/login");
                  return;
                }
                //check if the user's profile is completed, if not, redirect to profile edit page.
                if (!isProfileCompleted) {
                  alert(
                    "Your profile is not yet complete! Please complete your profile before queuing."
                  );
                  navigate("/profile");
                  return;
                }

                const remaining = getRefreshTokenRemainingTime();
                //the limit is it remaiing time has to be at least 1 hour remaining (3600 secs)
                if (remaining === null || remaining < 3600) {
                  alert(
                    "Your session is about to expire. Please login again before queuing!"
                  );
                  logout();
                } else {
                  setTriggeredEventListener(true);
                }
              }}
            >
              Queue
            </button>
          </div>
        ) : (
          <div>
            <div className="font-bold text-[25px] mb-2">
              Waiting to be matched...
            </div>
            <div className="flex justify-center items-center gap-2">
              <div className="w-3 h-3 bg-gray-700 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-gray-700 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-3 h-3 bg-gray-700 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
            <button
              className="bg-gray-900 mt-8 hover:bg-gray-800 text-gray-200 font-semibold py-3 px-6 rounded"
              onClick={() => {
                setTriggeredEventListener(false);
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Queue;
