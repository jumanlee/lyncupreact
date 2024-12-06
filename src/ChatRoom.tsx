import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from './axiom'; // Import your Axios instance

interface MessageObject {
    sender: string;
    text: string;
}

const ChatRoom: React.FC = () => {
    const [messages, setMessages] = useState<MessageObject[]>([]);
    const [inputMessage, setInputMessage] = useState<string>('');
    const websocketRef = useRef<WebSocket | null>(null);
    const isWebSocketInitialised = useRef<boolean>(false);

    const getValidAccessToken = async (): Promise<string | null> => {
        let accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        
    
        if (!accessToken || !refreshToken) {
            console.error('Access or Refresh token not found in localStorage!');
            return null;
        }
    
        // Decode token and check expiry
        const tokenParts = JSON.parse(atob(refreshToken.split('.')[1]));
        const now = Math.ceil(Date.now() / 1000);
    
        if (tokenParts.exp > now) {
            try {
                const response = await axiosInstance.post('/token/refresh/', {
                    refresh: refreshToken,
                });
                if (response.data.access) {
                    accessToken = response.data.access;
                    if (accessToken){
                        localStorage.setItem('access_token', accessToken);
                        axiosInstance.defaults.headers['Authorization'] = `JWT ${accessToken}`;

                    }

                }
            } catch (error) {
                console.error('Failed to refresh token:', error);
                window.location.href = '/login/';
                return null;
            }
        }
    
        return accessToken;
    };
    

    useEffect(() => {
        const fetchTokenAndConnectWebSocket = async () => {
            //this conditional checking is necessary because React's Strict Mode causes useEffect to run twice in development, leading to multiple WebSocket connections and duplicated message event listeners. Note that if I refresh the web page, the isWebSocketInitialised.current becomes false.
            if (isWebSocketInitialised.current) return; 
            isWebSocketInitialised.current = true;

            try {
                // Validate and retrieve token from localStorage using Axios
                // const token = localStorage.getItem('access_token');
                const token = await getValidAccessToken();
                const groupname = "hello_world";

                if (!token) {
                    console.error('Token not found in localStorage!');
                    return;
                }


                // Open WebSocket connection
                const url = `ws://localhost:8080/ws/${groupname}/?token=${token}`;
                websocketRef.current = new WebSocket(url);
                // websocketRef.current = websocket;

                websocketRef.current.addEventListener('open', () => {
                    console.log('WebSocket connection established');
                });

                websocketRef.current.addEventListener('message', (event) => {
                    console.log('Message from server:', event.data);
                    const data = JSON.parse(event.data);

                    //the double rendering in the console is  caused by React Strict Mode in development. React Strict Mode intentionally renders components twice in development to help identify potential issues like side effects in components or hooks. This double rendering only happens in development mode and does not occur in the production build.
                    setMessages((prevMessages) => {
                        console.log('Previous messages state:', prevMessages);
                        console.log('New message being added:', data); 
                        return [...prevMessages, data]
                    });
                });

                websocketRef.current.addEventListener('error', (error) => {
                    console.error('WebSocket error:', error);
                });

                websocketRef.current.addEventListener('close', () => {
                    console.log('WebSocket connection closed');
                });

            } catch (error) {
                console.error('Failed to validate token or connect WebSocket:', error);
            }
        };

        fetchTokenAndConnectWebSocket();

        return () => {
            // websocket.close();
            if (websocketRef.current) {
                websocketRef.current.close();
                console.log('WebSocket closed in cleanup');
            }
        };
    }, []);

    const sendMessage = () => {
        if (websocketRef.current && inputMessage.trim() !== '') {
            const messageData = {
                text: inputMessage,
            };
            websocketRef.current.send(JSON.stringify(messageData));
            setInputMessage('');
        }
    };

    return (
        <div>
            <div>
                <h1>Chat Room</h1>
                <div style={{ border: '1px solid black', height: '300px', overflowY: 'scroll' }}>
                    {messages.map((message, index) => (
                        <div key={index}>
                            <strong>{message.sender}</strong> {message.text}
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatRoom;



