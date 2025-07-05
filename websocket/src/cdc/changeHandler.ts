import { ChangeType, Client, Message } from "../data/types";
import { WebSocket } from "ws";

export function changeHandler({ type, payload, clients }: { type: ChangeType, payload: Message, clients: Map<WebSocket, Client> }) {
    if (type === "insert") {
        clients.forEach((client, socket) => {
            if (client.chatId === payload.chatId) {
                socket.send(JSON.stringify({ type: 'msg', payload: payload }));
            }
        });
    }
}