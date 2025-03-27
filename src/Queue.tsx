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
    <div className="bg-gray-200 min-h-[calc(100vh-125px)] text-gray-700">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-5 mt-5 px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Ready for a quick chat?
          </h1>

          <p className="mb-4 text-lg">
            LyncUp connects you with 3 other remote workers for a short,
            friendly convo, just like bumping into someone in the breakroom.
          </p>

          <p className="mb-4 text-lg">
            When you're ready, click the button below to join the queue and get
            matched.
          </p>
        </div>

        {!triggeredEventListener ? (
          <div>
            <button
              className="bg-[#4b1e1e] hover:opacity-75 text-gray-200 font-semibold py-3 px-6 rounded"
              onClick={() => {
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
            <div className="font-bold text-[25px] mb-4">
              Waiting to be matched...
            </div>
            <div className="flex justify-center items-center gap-2">
              <div className="w-3 h-3 bg-gray-700 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-gray-700 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-3 h-3 bg-gray-700 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Queue;
