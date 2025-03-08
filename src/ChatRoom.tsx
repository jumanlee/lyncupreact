import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "./axiom";
import { useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
//icons taken from https://icons8.com/icons/set/thumbs-up--static--purple

const ChatRoom: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [members, setMembers] = useState<
    { user_id: number; firstname: string; lastname: string }[]
  >([]);
  const websocketRef = useRef<WebSocket | null>(null);
  const isWebSocketInitialised = useRef<boolean>(false);
  const [likes, setLikes] = useState<Record<number, boolean>>({});
  const [selfUserId, setSelfUserId] = useState<string | null>("");

  const location = useLocation();
  const navigate = useNavigate();

  //adapted code from https://medium.com/@velja/token-refresh-with-axios-interceptors-for-a-seamless-authentication-experience-854b06064bde
  //note: when a function is declared as async, it automatically returns a Promise, even if there’s no new Promise() inside
  //returning a Promise means that a function does not return a value immediately, but instead returns a Promise object that will resolve (success) or reject (failure) in the future.
  const getValidAccessToken = async (): Promise<string | null> => {
    let accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    if (!accessToken || !refreshToken) {
      console.error("Access or Refresh token not found in localStorage!");
      return null;
    }

    //decode token and check expiry
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
        // window.location.href = "/login/";
        navigate("/");
        return null;
      }
    }

    //the accessToken itself is NOT a Promise. Instead the function getValidAccessToken() returns a Promise that eventually resolves to accessToken (a string or null).
    return accessToken;
  };

  useEffect(() => {
    const fetchTokenAndConnectWebSocket = async () => {
      //this conditional checking is necessary because React's Strict Mode causes useEffect to run twice in development, leading to multiple WebSocket connections and duplicated message event listeners. Note that if I refresh the web page, the isWebSocketInitialised.current becomes false.
      if (isWebSocketInitialised.current) return;
      isWebSocketInitialised.current = true;

      try {
        const token = await getValidAccessToken();
        const { room_id } = location.state || {};
        // const groupname = "hello_world";

        if (!token) {
          console.error("Token not found in localStorage!");
          return;
        }

        if (!room_id) {
          console.error("no room_id received!");
          return;
        }

        //open Websocket connection
        const url = `ws://localhost:8080/ws/chat/${room_id}/?token=${token}`;
        console.log(url);
        websocketRef.current = new WebSocket(url);
        // websocketRef.current = websocket;

        websocketRef.current.addEventListener("open", () => {
          console.log("WebSocket connection established");
        });

        websocketRef.current.addEventListener("message", (event) => {
          console.log("Message from server:", event.data);
          const data = JSON.parse(event.data);

          //the double rendering in the console is  caused by React Strict Mode in development. React Strict Mode intentionally renders components twice in development to help identify potential issues like side effects in components or hooks. This double rendering only happens in development mode and does not occur in the production build.
          if (data.hasOwnProperty("text") && data["text"]) {
            setMessages((prevMessages) => {
              console.log("Previous messages state:", prevMessages);
              console.log("New message being added:", data["text"]);
              return [...prevMessages, data["text"]];
            });
          }

          if ("members" in data && data["members"]) {
            // data["members"] format is: {"members": [[1, "Youknow", "Who"]]}
            setMembers(
              data["members"].map(
                ([user_id, firstname, lastname]: [number, string, string]) =>
                  //convert the array to an object with keys user_id, firstname, lastname for easier management
                  ({ user_id, firstname, lastname })
              )
            );
          }
          //The below is to close the websocket paranthesis, remember this bit is all part of one websocket ref
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

    //store self user id in hook
    const getUserId = () => {
      const self_user_id = localStorage.getItem("user_id");
      if (self_user_id) {
        setSelfUserId(self_user_id);
      } else {
        console.log(
          "Failed to store self user id in hook as self_user_id is null"
        );
      }
    };

    fetchTokenAndConnectWebSocket();
    getUserId();

    return () => {
      // websocket.close();
      if (websocketRef.current) {
        websocketRef.current.close();

        //reset upon cleanup
        isWebSocketInitialised.current = false;
        console.log("WebSocket closed in cleanup");
      }
    };
  }, []);

  const sendMessage = () => {
    if (websocketRef.current && inputMessage.trim() !== "") {
      const messageData = {
        text: inputMessage,
      };
      websocketRef.current.send(JSON.stringify(messageData));
      setInputMessage("");
    }
  };

  //event: React.KeyboardEvent<HTMLInputElement> means the keyboard event (e) happening on an <input> element
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key == "Enter") {
      sendMessage();
    }
  };

  //event to handle likes
  const toggleLike = (user_id: number) => {

    //set post request string to be passed into .post
    //if the user_to has previously been liked, we need to unlike
    //otherwise, if not previously liked, it means user_from wants to like
    const postString = likes[user_id] ? "/users/unlike/" : "/users/like/";
    
    //update like state in database with API

    axiosInstance
      .post(postString, { user_to: user_id })
      .then((response) => {
        console.log(response);
        //update the likes state
        //check if the user_id is already in likes, if not, create with default false
        setLikes((prevLikes) => {
          //if user_id not in prevLikes dict, ?? will mean that prevLikeBool is assigned "false"
          //note that unlike in Python, if key is not in obj, javasript returns undefined, not a keyerror.
          const prevLikeBool = prevLikes[user_id] ?? false;
          const newLikeBool = !prevLikeBool;

          //wrap user_id in [] so that it renders dynamically and not put literal "user_id" as key. This previously caused lots of problems that are now fixed.
          const newLikes = { ...prevLikes, [user_id]: newLikeBool };
          return newLikes;
        });
      })
      .catch((error) => {
        console.error(error);
        console.error("failed api request like user with user_id:", user_id);
      });
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      {/* Chat Section */}
      <div className="flex flex-col flex-grow p-4">
        <h1 className="text-2xl font-bold text-purple-700 mb-4">
          Chat Room ID: 12257
        </h1>
        <div className="flex-grow overflow-y-auto bg-white border border-gray-300 rounded-lg p-4 mb-4">
          {messages.map((message, index) => (
            <div key={index} className="mb-2 text-gray-800">
              {message}
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={handleKeyPress}
            className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Send
          </button>
        </div>
      </div>

      {/* members section */}
      <div className="w-1/4 bg-gray-200 border-l border-gray-300 p-4">
        <h2 className="text-xl font-bold text-purple-700 mb-4">Members</h2>
        <div className="space-y-2">
          {members.map((member, index) => (
            <div
              key={member.user_id}
              className="flex justify-between p-2 bg-white border border-gray-300 rounded-lg text-gray-800"
            >
              <span>
                {member.firstname} {member.lastname}
              </span>

              {String(selfUserId) != String(member.user_id) ? (
                <button onClick={() => toggleLike(member.user_id)}>
                  <img
                    width="20"
                    height="20"
                    src={
                      likes[member.user_id]
                        ? "https://img.icons8.com/fluency-systems-filled/50/7950F2/thumb-up.png"
                        : "https://img.icons8.com/fluency-systems-regular/50/7950F2/thumb-up.png"
                    }
                    alt="thumb-up"
                  />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
