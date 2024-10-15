import React, { useEffect } from 'react';
import { useState } from 'react';
import ChatRoom from './ChatRoom';

const Login = (props) => {
    const [username, setUsername] = useState();
    const [usernameIsAvailable, setUsernameIsAvailable] = useState(0);
    const socket = props.props;

    useEffect(() => {
        socket.on("userNameIsAvailable", (data) => {
            setUsernameIsAvailable(data);
        });

        return () => {
            socket.off("userNameIsAvailable");
        };
    }, []);

    const onEntered = () => {
        if(username)
        {
            socket.emit("checkUsernameAvaibility", username);
        }
        else
        {
            alert('Username cannot be empty')
        }
    };

    if (usernameIsAvailable === 1) {
        let properties = {
            socket: socket,
            username: username
        };
        return (
            <ChatRoom props={properties} />
        );
    } else {
        return (
            <div className="flex items-center justify-center h-screen animated-gradient">
                <div className="bg-teal-500 p-8 rounded-lg shadow-lg">
                    <h2 className="text-4xl font-semibold text-white text-center mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Welcome To Chatonymous</h2>
                    <input
                        type="text"
                        placeholder="Enter Username"
                        onChange={(e) => { setUsername(e.target.value) }}
                        className="w-full p-2 mb-4 border border-teal-300 rounded focus:outline-none focus:ring focus:ring-teal-200"
                    />
                    <button
                        onClick={onEntered}
                        className="w-full bg-white text-teal-500 py-2 rounded hover:bg-teal-100 transition duration-200"
                    >
                        Enter
                    </button>
                    {usernameIsAvailable === -1 && (
                        <h4 className="text-red-500 text-center mt-2">This username is not available</h4>
                    )}
                </div>
            </div>
        );
    }
};

export default Login;
