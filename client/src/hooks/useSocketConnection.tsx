import { useRef, useState } from "react";
import { SOCKET_URL } from "../data/const";
import { MessageData, ServerState } from "../data/types";


export const useSocketConnection = (
    onMessage: (data: MessageData) => void,
    onClose: () => void,
    chatId: number | null = null,
) => {
    const [readyState, setReadyState] = useState<ServerState>("LOADING");
    const server = useRef<WebSocket | null>(null);

    // SERVER CONNECTION
    const connectToServer = () => {
        if (!chatId) {
            console.log('No chatId provided');
            setReadyState("CLOSED");
            return;
        } else if (server.current) {
            return;
        }

        setReadyState("LOADING");
        server.current = new WebSocket(SOCKET_URL);

        server.current.onopen = () => {
            console.log('Connected to the WS Server');
            setReadyState("CONNECTING");
            server.current?.send(JSON.stringify({ type: 'init', payload: { chatId: chatId } }));
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
            if(data.type === "init") {
                setReadyState("OPEN");
            }
            onMessage(data);
        };
    }

    return { readyState, connectToServer, server };

}