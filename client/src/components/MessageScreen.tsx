import { Message } from "../data/types";
import { SERVER_URL } from "../data/const";
import { v4 as uuidv4 } from 'uuid';
import { AuthState } from "../providers/AuthProvider";
import Container from "./Container";

export const MessageScreen = (props: {
    messages: Message[];
    newMessage: string;
    setNewMessage: (msg: string) => void;
    listRef: React.RefObject<HTMLDivElement | null>
    chatId: number | null;
    authState: AuthState;
}) => {
    const { messages, newMessage, setNewMessage, listRef, chatId, authState } = props;

    const sendMessage = (msg: string) => {
        if (msg.trim() === '') return;
        const id = uuidv4();
        const message = { msg: msg, refId: id, chatId: chatId };
        fetch(`${SERVER_URL}/messages`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        }).then((res) => {
            if (!res.ok) {
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

        <Container>
            <div className='flex flex-col max-h-full overflow-y-auto pb-10 scrollbar-hide' ref={listRef}>
                {messages.map((message, index) => (
                    <div key={index} className={`${message.userId == authState.id ? "bg-message-me self-end" : "bg-message" } px-4 py-2 rounded-xl my-2 w-[80%]`}>
                        {message.msg}
                    </div>
                ))}
            </div>
            <div className="w-full absolute bottom-4 left-0 px-6">
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button
                        className="btn"
                        onClick={() => {
                            sendMessage(newMessage);
                            setNewMessage('');
                        }}
                    >
                        Send
                    </button>
                </div>
            </div>
        </Container>
    )
}