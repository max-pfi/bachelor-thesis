import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { MessageScreen } from "./MessageScreen";
import { useParams } from "react-router";
import { useAuth } from "../providers/AuthProvider";

export const ChatScreen = () => {
    const [newMessage, setNewMessage] = useState('');
    const {authState} = useAuth();
    const { id } = useParams();
    const chatId = id ? parseInt(id) : null;
    const { readyState, messages, connectToServer } = useWebSocket(chatId);

    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages]);

    if (readyState === "OPEN") {
        return MessageScreen({ messages, newMessage, setNewMessage, listRef, chatId, authState });
    } else if (readyState === "LOADING") {
        return (
            <p>Loading...</p>
        )

    } else if (readyState === "CONNECTING") {
        return (
            <p>Connecting...</p>
        )
    } else {
        return (
            <button onClick={connectToServer}>Connect to server</button>
        )
    }
}