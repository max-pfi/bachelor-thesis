import { useRef, useState } from "react";
import { SOCKET_URL } from "../data/const";
import { MessageData, ServerState } from "../data/types";


export const useSocketConnection = (
    onMessage: (data: MessageData) => void,
    onClose: () => void
) => {
    const [readyState, setReadyState] = useState<ServerState>("LOADING");
    const server = useRef<WebSocket | null>(null);

    // SERVER CONNECTION
    const connectToServer = () => {
        if (server.current) return;
        setReadyState("LOADING");
        server.current = new WebSocket(SOCKET_URL);

        server.current.onopen = () => {
            console.log('Connected to the WS Server');
            setReadyState("OPEN");
        };

        server.current.onclose = () => {
            console.log('Disconnected from the WS Server');
            setReadyState("CLOSED");
            onClose();
            server.current = null;
        };

        server.current.onerror = (error) => {
            console.log('Error:', error);
            server.current?.close();
        }

        server.current.onmessage = (event) => {
            const data = JSON.parse(event.data) as MessageData;
            onMessage(data);
        };
    }
        
    return { readyState, connectToServer, server };

}