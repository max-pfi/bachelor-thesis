import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { MessageScreen } from "./MessageScreen";
import { useParams } from "react-router";
import { useAuth } from "../providers/AuthProvider";
import AppScreen from "./AppScreen";

export const ChatScreen = () => {
    const [newMessage, setNewMessage] = useState('');
    const { authState } = useAuth();
    const { id } = useParams();
    const chatId = id ? parseInt(id) : null;
    const { readyState, messages, connectToServer } = useWebSocket(chatId);

    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages]);


    return (
        <AppScreen>
            {readyState === "OPEN" && (
                <MessageScreen
                    messages={messages}
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    listRef={listRef}
                    chatId={chatId}
                    authState={authState}
                />
            )}
            {readyState === "LOADING" && (
                <p>Loading...</p>
            )}
            {readyState === "CONNECTING" && (
                <p>Connecting...</p>
            )}
            {readyState === "CLOSED" && (
                <button onClick={connectToServer}>Connect to server</button>
            )}

        </AppScreen>
    )
}