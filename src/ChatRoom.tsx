import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "./axiom";
import { useLocation, useNavigate } from "react-router-dom";
//icons taken from https://icons8.com/icons/set/thumbs-up--static--purple

import ProfileModal, { ProfileData } from "./ProfileModal";

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

  //for displaying selected profile
  const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(
    null
  );

  //for tracking message bottom position so that user always sees the latest messaage.
  //this gives direct access to the DOM node of the scrollable div that contains all the chat messages
  //this is then attached to the message container
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const [otherUsersData, setOtherUsersData] = useState<ProfileData[]>([]);

  //adapted code from https://medium.com/@velja/token-refresh-with-axios-interceptors-for-a-seamless-authentication-experience-854b06064bde
  //note: when a function is declared as async, it automatically returns a Promise, even if there’s no new Promise() inside
  //returning a Promise means that a function does not return a value immediately, but instead returns a Promise object that will resolve (success) or reject (failure) in the future.
  const getValidAccessToken = async (): Promise<string | null> => {
    //this bit of checks here are necessary for websockets connections and are not handled by axiom!
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
        navigate("/");
        return null;
      }
    }

    //the accessToken itself is NOT a Promise. Instead the function getValidAccessToken() returns a Promise that eventually resolves to accessToken (a string or null).
    return accessToken;
  };

  //Promise<void> expected to call resolve() with no value
  const fetchTokenAndConnectWebSocket = async (): Promise<void> => {
    //this conditional checking is necessary because React's Strict Mode causes useEffect to run twice in development, leading to multiple WebSocket connections and duplicated message event listeners. Note that if I refresh the web page, the isWebSocketInitialised.current becomes false.
    if (isWebSocketInitialised.current) return;
    isWebSocketInitialised.current = true;

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

    //return a promise to see whether websocket connections are properly establsihed
    return new Promise((resolve, reject) => {
      websocketRef.current = new WebSocket(url);
      // websocketRef.current = websocket;

      websocketRef.current.addEventListener("open", () => {
        console.log("WebSocket connection established");
        resolve();
      });

      websocketRef.current.addEventListener("error", (error) => {
        console.error("Websocket error:", error);
        reject(error);
      });

      websocketRef.current.addEventListener("close", () => {
        console.log("WebSocket connection closed");
      });

      //websocket that listens to incoming info (including chat messages and members joined) from server. The chat messages include names of senders too, to be displayed.
      websocketRef.current.addEventListener("message", (event) => {
        console.log("Message from server:", event.data);
        const data = JSON.parse(event.data);

        //the double rendering in the console is caused by React Strict Mode in development. React Strict Mode intentionally renders components twice in development to help identify potential issues like side effects in components or hooks. This double rendering only happens in development mode and does not occur in the production build.
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
    });
  };

  //store self user id in hook
  const getUserOwnId = () => {
    const self_user_id = localStorage.getItem("user_id");
    if (self_user_id) {
      setSelfUserId(self_user_id);
    } else {
      console.log(
        "Failed to store self user id in hook as self_user_id is null"
      );
    }
  };

  const getOtherUsersData = () => {
    //data structure:
    // {"firstname":"Harry","lastname":"Potter","aboutme":"I'm a good person","citytown":"London","country":"UK","age":20,"gender":"M", organisation_id: 5, organisation_name: "Disney"}
    //path e.g.: /api/users/showmultiprofiles/?user_ids=1,2
    console.log("members");
    console.log(members);
    //retrieve all other users' ids. Important to use set as there could be a chance of duplication, so must prevent it.
    let otherUsersIdsSet = new Set();
    for (let i = 0; i < members.length; i++) {
      if (Number(members[i].user_id) !== Number(selfUserId))
        otherUsersIdsSet.add(members[i].user_id);
    }

    if (otherUsersIdsSet.size === 0) return;

    //convert to array
    let otherUsersIdsArray = [...otherUsersIdsSet];
    console.log(otherUsersIdsArray);

    axiosInstance
      .get("users/showmultiprofiles/", {
        params: {
          user_ids: otherUsersIdsArray.join(","), //turns [2,4,8] into "2,4,8"
        },
      })
      .then((response) => {
        console.log("multiprofiles API success!");
        setOtherUsersData(response.data);
      })
      .catch((error) => {
        console.error("multiprofiles API failed", error);
      });
  };

  //useffect to connect to websocket and get initial data
  useEffect(() => {
    const setupConnectionAndFetchInitialData = async () => {
      try {
        await fetchTokenAndConnectWebSocket();
        getUserOwnId();
      } catch (error) {
        console.error("Websocket connection failed", error);
      }
    };

    setupConnectionAndFetchInitialData();

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

  //useEffect to detect member whenever they join. Use this to collect other users' profile data
  useEffect(() => {
    if (selfUserId && members.length > 0) {
      getOtherUsersData();
    }
    console.log(otherUsersData);
  }, [members, selfUserId]);

  const sendMessage = () => {
    if (
      websocketRef.current?.readyState === WebSocket.OPEN &&
      inputMessage.trim() !== ""
    ) {
      const messageData = {
        text: inputMessage,
      };
      websocketRef.current.send(JSON.stringify(messageData));
      setInputMessage("");
    } else {
      console.warn("Websocket not open or message is empty. Message not sent.");
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

  //for message bottom position so that user always sees the latest messaage.
  useEffect(() => {
    if (messagesEndRef.current) {
      //scrollTop set to scrollHeight, it then jumps to the very bottom of the messages container.
      //scrollTop is a built-in javascript property on HTML elements, it tells how far the element has been scrolled vertically from the top
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-[83vh] flex gap-4 p-4 bg-gray-400 ">
      {/* Chat Section */}
      <div className="flex flex-col w-3/4 h-full  rounded-lg overflow-hidden">
        {/* <h1 className="text-2xl font-bold text-purple-700 mb-4">
          Chat Room ID: 12257
        </h1> */}
        <div
          ref={messagesEndRef}
          className="flex-1 overflow-y-auto bg-gray-300 border border-gray-300 rounded-lg p-4 mb-4"
        >
          {messages.map((message, index) => (
            <div key={index} className="mb-2 text-base text-gray-600 font-semibold break-words">
              {message}
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Send a message..."
            onKeyDown={handleKeyPress}
            className="flex-grow px-4 py-2 bg-gray-300 rounded-lg font-semibold focus:outline-none text-base text-gray-600"
          />
          <button
            onClick={sendMessage}
            className="bg-gray-900 hover:bg-gray-800 text-gray-400 font-semibold py-2 px-4 rounded-lg"
          >
            Send
          </button>
        </div>
      </div>

      {/* members section */}
      <div className="w-1/4 bg-gray-800 rounded-lg p-4 relative flex flex-col">
        <h2 className="text-xl text-gray-400 font-semibold mb-4">Members</h2>
        <div className="space-y-2">
          {members.map((member, index) => (
            <div
              key={member.user_id}
              className="flex justify-between p-2 bg-gray-200 border border-gray-300 rounded-lg text-base text-gray-600 font-bold shadow-sm"
              onClick={() => {
                console.log("otherUsersData");
                console.log(otherUsersData);
                if (Number(selfUserId) !== Number(member.user_id)) {
                  const profile = otherUsersData.find(
                    //don't need to first check if item has user_id in JS as it won't throw an error like in Python, it would just be undefined
                    (item) => Number(item.user_id) === Number(member.user_id)
                  );
                  if (profile) {
                    setSelectedProfile(profile);
                  } else {
                    console.warn(
                      "profile data not found for user",
                      member.user_id
                    );
                  }
                }
              }}
            >
              <span
                className={
                  Number(selfUserId) !== Number(member.user_id)
                    ? "cursor-pointer"
                    : ""
                }
              >
                {member.firstname} {member.lastname}
              </span>

              {Number(selfUserId) != Number(member.user_id) && (
                <button
                  onClick={(event) => {
                    //we need event as we need stopPropogation to prevent the event from bubbling up and affecting the parent's oncClick!
                    event.stopPropagation();
                    toggleLike(member.user_id);
                  }}
                >
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
              )}
            </div>
          ))}
        </div>
        {/* quit button aligned bottom-right */}
        <div className="mt-4 self-end">
          <button
            onClick={() => navigate("/queue")}
            className="absolute bottom-3 right-3 bg-[#4b1e1e] hover:bg-[#4b1e1ecc] text-white font-semibold py-2 px-5 rounded-lg transition duration-150 shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-800"
          >
            Quit
          </button>
        </div>
      </div>
      {/* Profile modal */}
      {selectedProfile && (
        <ProfileModal
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  );
};

export default ChatRoom;
