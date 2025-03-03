import { Message, User } from "../data/types";



export const MessageScreen = (props: {
    newMessage: string;
    setNewMessage: (value: string) => void;
    sendMessage: (message: string) => void;
    user: User;
    messages: Message[];
}) => {
    const { newMessage, setNewMessage, sendMessage, user, messages } = props;
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