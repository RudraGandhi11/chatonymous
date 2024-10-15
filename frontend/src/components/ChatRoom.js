import React, { useState, useEffect, useRef } from 'react';

const ChatRoom = (props) => {
    const [senderUsername, setSenderUsername] = useState();
    const [recipientUsername, setRecipientUsername] = useState();
    const [connected, setConnected] = useState();
    const [messageSend, setMessageSend] = useState('');
    const [chatMessages, setChatMessage] = useState([]);
    const [gotSkipped, setGotSkipped] = useState();
    const [userIsTyping, setUserIsTyping] = useState(false);
    const socket = props.props.socket;
    const username = props.props.username;

    const chatContainerRef = useRef(null);  // Create a reference for the chat container

    useEffect(() => {
        socket.emit("checkWaitingList", username);

        socket.on("connected-pair", (data) => {
            setConnected(data.connected);
            setSenderUsername(username);
            setRecipientUsername(data.uname);
        });

        socket.on("recieve-message", (data) => {
            setChatMessage(prevMessages => [...prevMessages, data]);
        });

        socket.on("got-skipped", (data) => {
            setGotSkipped(data.gotSkipped);
        });

        socket.on("is-typing", (data) => {
            setUserIsTyping(data.isTyping);
            setTimeout(() => {
                setUserIsTyping(false);
            }, 3000);
        });

        return () => {
            socket.off("connected-pair");
            socket.off("recieve-message");
            socket.off("is-typing");
        };
    }, []);

    useEffect(() => {
        // Scroll to bottom whenever chatMessages changes
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages]); // Trigger when chatMessages array changes

    const sendMessage = () => {
        socket.emit("send-message", { toUser: recipientUsername, fromUser: senderUsername, content: messageSend });
        socket.emit("user-is-typing", { userIsTyping: false, toUser: recipientUsername });
        setChatMessage(prevMessages => [...prevMessages, { toUser: recipientUsername, fromUser: senderUsername, content: messageSend }]);
        setMessageSend(''); // Clear the input field after sending the message
    };

    const setMessage = (event) => {
        socket.emit("user-is-typing", { userIsTyping: true, toUser: recipientUsername });
        setMessageSend(event.target.value);
    };

    const skipChat = () => {
        socket.emit("skip-chat", { skipBy: senderUsername, skipTo: recipientUsername });
        setGotSkipped(false);
        setSenderUsername('');
        setRecipientUsername('');
        setConnected(false);
        setMessageSend('');
        setChatMessage([]);
        socket.emit("checkWaitingList", username);
    };

    if (gotSkipped) {
        const okButtonClicked = () => {
            setGotSkipped(false);
            setSenderUsername('');
            setRecipientUsername('');
            setConnected(false);
            setMessageSend('');
            setChatMessage([]);
            socket.emit("checkWaitingList", username);
        };
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="bg-white p-4 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-bold">{recipientUsername} Skipped You</h3> {/* Increased font size */}
                    <button onClick={okButtonClicked} className="bg-teal-500 text-white py-1 px-4 rounded mt-2">Ok</button>
                </div>
            </div>
        );
    } else if (connected) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="border-4 border-teal-500 w-full md:w-2/3 lg:w-1/2 h-3/4 bg-gray-100 flex flex-col">
                    <div className="bg-teal-200 p-4 flex items-center justify-between">
                        <h2 className="font-bold">{recipientUsername}</h2>
                        {/* Display sender's username */}
                        <p className="text-teal-700 font-bold">{senderUsername}</p>
                    </div>
                    {/* Chat message container */}
                    <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto">
                        {chatMessages.map((messages, index) => {
                            const isSender = messages.fromUser === username;
                            return (
                                <div key={index} className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-2`}>
                                    <div className={`p-2 rounded-lg ${isSender ? 'bg-teal-500 text-white' : 'bg-gray-200 text-black'}`}>
                                        <p>{messages.content}</p>
                                    </div>
                                </div>
                            );
                        })}
                        {/* Show typing status if user is typing */}
                        {userIsTyping && (
                            <div className="flex justify-start mb-2">
                                <div className="p-2 bg-gray-200 text-black rounded-lg">
                                    <p>Typing...</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4 flex flex-col sm:flex-row sm:flex-wrap">
                        <input
                            value={messageSend} // Bind the input value to the state
                            placeholder={'Type your message'}
                            onChange={setMessage}
                            className="border border-gray-300 rounded-lg flex-grow px-3 py-2 mr-2 mb-2 sm:mb-0"
                        />
                        <button onClick={sendMessage} className="bg-teal-500 text-white py-2 px-4 rounded mb-2 sm:mb-0">Send</button>
                        <button onClick={skipChat} className="bg-red-500 text-white py-2 px-4 rounded ml-0 sm:ml-2">Skip</button>
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div className="flex justify-center items-center h-screen">
                <h1 className="text-3xl font-bold">Waiting for a match...</h1> {/* Increased font size */}
            </div>
        );
    }
};

export default ChatRoom;
