import { WebSocket } from "ws";
import { Message, initPayload, InitRequest, Client } from "../data/types";
import { db } from "../db/db";

export const handleInit = async (socket: WebSocket, payload: InitRequest, clients: Map<WebSocket, Client>) => {
    const {chatId} = payload;
    clients.set(socket, { chatId });

    const dbMessages : Message[] = await db.query(`
            SELECT 
                message.user_id, 
                users.username, 
                message.msg, 
                message.ref_id 
            FROM message
            JOIN users ON message.user_id = users.id
            WHERE message.chat_id = $1
            ORDER BY message.created_at
        `, [chatId]).then((res) => {
        return res.rows.map((row) => {
            return { userId: row.user_id, username: row.username, msg: row.msg, refId: row.ref_id };
        });
    })

    const response: initPayload = { messages: dbMessages };
    socket.send(JSON.stringify({ type: 'init', payload: response }));
}