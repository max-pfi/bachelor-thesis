import { useWebSocket } from "../hooks/useWebSocket";
import { MessageScreen } from "./MessageScreen";
import { NameInputScreen } from "./NameInputScreen";

export const HomeScreen = () => {
    const { readyState, messages, user, connectToServer, nameTaken, sendInit } = useWebSocket();

    if (readyState === "OPEN" && user && user.name) {
        return MessageScreen({ messages, user });
    } else if (readyState === "OPEN" && user && !user.name) {
        return (
            <NameInputScreen sendInit={sendInit} nameTaken={nameTaken} />
        )
    } else if (readyState === "OPEN" && !user) {
        return (
            <p>Waiting for user connection...</p>
        )
    } else if (readyState === "LOADING") {
        return (
            <p>Connecting...</p>
        )
    } else {
        return (
            <button onClick={connectToServer}>Connect to server</button>
        )
    }
}