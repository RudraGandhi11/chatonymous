import React, { useState, useEffect } from 'react';

const ChatRoom = (props) => {
    const [senderUsername, setSenderUsername] = useState();
    const [recipientUsername, setRecipientUsername] = useState();
    const [connected, setConnected] = useState();
    const [messageSend, setMessageSend] = useState('');
    const [chatMessages, setChatMessage] = useState([]);
    const [gotSkipped, setGotSkipped] = useState();
    const socket = props.props.socket;
    const username = props.props.username;

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

        return () => {
            socket.off("connected-pair");
            socket.off("recieve-message");
        };
    }, []);

    const sendMessage = () => {
        socket.emit("send-message", { toUser: recipientUsername, fromUser: senderUsername, content: messageSend });
        setChatMessage(prevMessages => [...prevMessages, { toUser: recipientUsername, fromUser: senderUsername, content: messageSend }]);
        setMessageSend(''); // Clear the input field after sending the message
    };

    const setMessage = (event) => {
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
                    <h3 className="text-xl font-bold">{recipientUsername} Skipped You</h3> {/* Increased font size */}
                    <button onClick={okButtonClicked} className="bg-teal-500 text-white py-1 px-4 rounded mt-2">Ok</button>
                </div>
            </div>
        );
    } else if (connected) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="border-4 border-teal-500 w-1/2 h-3/4 bg-gray-100 flex flex-col">
                    <div className="bg-teal-200 p-4 flex items-center justify-between">
                        <h2 className="font-bold">{recipientUsername}</h2>
                        <div className="w-8 h-8 bg-teal-300 rounded-full"></div> {/* Placeholder for account logo */}
                    </div>
                    <div className="flex-grow p-4 overflow-y-auto">
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
                    </div>
                    <div className="p-4 flex">
                        <input
                            value={messageSend} // Bind the input value to the state
                            placeholder={'Type your message'}
                            onChange={setMessage}
                            className="border border-gray-300 rounded-lg flex-grow px-3 py-2 mr-2"
                        />
                        <button onClick={sendMessage} className="bg-teal-500 text-white py-2 px-4 rounded">Send</button>
                        <button onClick={skipChat} className="bg-red-500 text-white py-2 px-4 rounded ml-2">Skip</button>
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div className="flex justify-center items-center h-screen">
                <h1 className="text-2xl font-bold">Waiting for a match...</h1> {/* Increased font size */}
            </div>
        );
    }
}

export default ChatRoom;
