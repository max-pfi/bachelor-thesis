import { WebSocket } from "ws";
import { Client, rawMessage, Message } from "../data/types";
import { db } from "../db/db";

export const handleMessage = async (socket: WebSocket, payload: rawMessage, clients: Map<WebSocket, Client>) => {
    const user = clients.get(socket);
    if (!user?.userName) {
        console.error('User not found');
        return;
    }
    const { message } = payload;
    const { userName } = user;
    await db.query('INSERT INTO message (username, msg) VALUES ($1, $2)', [userName, message])
}