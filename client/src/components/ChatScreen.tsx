import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { MessageScreen } from "./MessageScreen";
import { useLocation, useParams } from "react-router";
import { useAuth } from "../providers/AuthProvider";
import AppScreen from "./AppScreen";
import Container from "./Container";
import { ContainerHeader } from "./ContainerHeader";

export const ChatScreen = () => {
    const [newMessage, setNewMessage] = useState('');
    const { authState } = useAuth();
    const { id } = useParams();
    const chatId = id ? parseInt(id) : null;
    const { readyState, messages, connectToServer } = useWebSocket(chatId, authState.jwt);
    const location = useLocation();

    const listRef = useRef<HTMLDivElement>(null);

    const { chatName } = location.state || {};

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages]);


    return (
        <AppScreen>
            <ContainerHeader title={chatName}>
                <button onClick={
                    () => {
                        window.history.back();
                    }
                } className="btn-hover opacity-50">Back</button>
            </ContainerHeader>
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
                <Container style="items-center justify-center gap-4">
                    <p>Loading...</p>
                </Container>
            )}
            {readyState === "CONNECTING" && (
                <Container style="items-center justify-center gap-4">
                    <p>Connecting...</p>
                </Container>
            )}
            {readyState === "CLOSED" && (
                <Container style="items-center justify-center gap-4">
                    <p>Connection closed</p>
                    <button className="btn" onClick={connectToServer}>Retry</button>
                </Container>

            )}
        </AppScreen>
    )
}