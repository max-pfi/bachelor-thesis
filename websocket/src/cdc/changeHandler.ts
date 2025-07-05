import { ChangeType, Client, Message } from "../data/types";
import { WebSocket } from "ws";

export function changeHandler({ type, payload, chatId, clients }: { type: ChangeType, payload: Message, chatId: number, clients: Map<WebSocket, Client> }) {
    if (type === "insert") {
        clients.forEach((client, socket) => {
            if (client.chatId === chatId) {
                socket.send(JSON.stringify({ type: 'msg', payload: payload }));
            }
        });
    }
}