import { useState } from "react";
import { Message, User } from "../data/types";
import { SERVER_URL } from "../data/const";

export const MessageScreen = (props: {
    user: User;
    messages: Message[];
}) => {
    const { user, messages } = props;
    const [newMessage, setNewMessage] = useState('');

    const sendMessage = (msg: string) => {
        if(msg.trim() === '') return;
        const message = { user: user.name, msg: msg };
        fetch(`${SERVER_URL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        }).then((res) => {
            if(!res.ok) {
                window.alert('Failed to send message');
            }
        }).catch((e) => {
            console.error(e);
            window.alert('Failed to send message');
        });
    }
    
    return (
        <>
            <div className='info-header'>
                <p>Client ID: {user.name}</p>
            </div>
            <div className='message-container'>
                <div className='message-list'>
                    {messages.map((message, index) => (
                        <div key={index} className={`message ${message.user === user.name ? 'my-message' : ''}`}>
                            {message.msg}
                        </div>
                    ))}
                </div>
                <div className='input-container'>
                    <input
                        type='text'
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button
                        onClick={() => {
                            sendMessage(newMessage);
                            setNewMessage('');
                        }}
                    >
                        Send
                    </button>
                </div>
            </div>
        </>
    )
}