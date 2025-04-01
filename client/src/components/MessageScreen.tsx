import { Message } from "../data/types";
import { SERVER_URL } from "../data/const";
import { v4 as uuidv4 } from 'uuid';
import { AuthState } from "../providers/AuthProvider";

export const MessageScreen = (props: {
    messages: Message[];
    newMessage: string;
    setNewMessage: (msg: string) => void;
    listRef: React.RefObject<HTMLDivElement | null>
    chatId: number | null;
    authState: AuthState;
}) => {
    const {  messages, newMessage, setNewMessage, listRef, chatId, authState } = props;

    const sendMessage = (msg: string) => {
        if(msg.trim() === '') return;
        const id = uuidv4();
        const message = { msg: msg, refId: id, chatId: chatId }; 
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
                <p>Name: {authState.username}</p>
            </div>
            <div className='message-container'>
                <div className='message-list' ref={listRef}>
                    {messages.map((message, index) => (
                        <div key={index} className={`message`}>
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