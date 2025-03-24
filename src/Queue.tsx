import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "./axiom"; // Import your Axios instance
import { useNavigate } from "react-router-dom";
import { useAuth } from "./App";

const Queue: React.FC = () => {
  //consider using atob instead of localstorage for token storage, for later development
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  const websocketRef = useRef<WebSocket | null>(null);
  const isWebSocketInitialised = useRef<boolean>(false);
  const [triggeredEventListener, setTriggeredEventListener] =
    useState<boolean>(false);

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

  const logout = () => {
    //remove all the tokens from browser
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    //also remove the user id
    localStorage.removeItem("user_id");
    setIsAuthenticated(false);

    navigate("/");
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

        const url = `ws://localhost:8080/ws/queue/?token=${token}`;
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
            console.log("entered room_id navigate");
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

  return (
    <div className="flex justify-center items-center h-screen">
      {!triggeredEventListener ? (
        <div>
          <button
            className="
                        px-4 py-2 
                        bg-blue-500 
                        text-white 
                        font-medium 
                        rounded-md 
                        shadow-md 
                        hover:bg-blue-600 
                        focus:outline-none focus:ring-2 focus:ring-blue-300 
                        active:bg-blue-700 
                        transition duration-200
                    "
            onClick={() => {
                const remaining = getRefreshTokenRemainingTime();
                //the limit is it remaiing time has to be at least 1 hour remaining (3600 secs)
                if (remaining === null || remaining < 1){
                    alert("Your session is about to expire. Please login again before queuing!");
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
        <div className="font-bold text-[25px]">Waiting to be matched...</div>
      )}
    </div>
  );
};

export default Queue;
