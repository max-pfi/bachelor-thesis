import { WebSocket } from "ws";
import { Client, rawName, Message, initPayload } from "../data/types";
import { db } from "../db/db";

export const handleInit = async (socket: WebSocket, payload: rawName, clients: Map<WebSocket, Client>) => {
    const userName = payload.name;
    const user = clients.get(socket);
    const userExists = Array.from(clients.values()).some((client) => client.userName === userName);
    let error : string | null = null;
    if(userExists) {
        error = "Name already taken";
    } else if (!userName) {
        error = "Invalid name";
    } else if (!user) {
        error = "User not found";
    }

    if(error) {
        const response: initPayload = { error, messages: [] };
        socket.send(JSON.stringify({ type: 'init', payload: response }));
        return;
    }

    user!.userName = userName;
    clients.set(socket, user!);

    const dbMessages : Message[] = await db.query('SELECT * FROM message').then((res) => {
        return res.rows.map((row) => {
            return { user: row.username, msg: row.msg };
        });
    })
    const response: initPayload = { name: userName, messages: dbMessages };
    socket.send(JSON.stringify({ type: 'init', payload: response }));
}