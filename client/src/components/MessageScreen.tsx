import { Message, User } from "../data/types";
import { SERVER_URL } from "../data/const";
import { v4 as uuidv4 } from 'uuid';

export const MessageScreen = (props: {
    user: User;
    messages: Message[];
    newMessage: string;
    setNewMessage: (msg: string) => void;
}) => {
    const { user, messages, newMessage, setNewMessage } = props;

    const sendMessage = (msg: string) => {
        if(msg.trim() === '') return;
        const id = uuidv4();
        const message = { user: user.name, msg: msg, refId: id };
        fetch(`${SERVER_URL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        }).then((res) => {
            if(!res.ok) {
                window.alert('Failed to send message');
            } else {
                setNewMessage('');
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