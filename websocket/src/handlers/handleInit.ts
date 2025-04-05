import { WebSocket } from "ws";
import { Message, initPayload, InitRequest, Client, TokenPayload } from "../data/types";
import { db } from "../db/db";
import * as jwt from 'jsonwebtoken';
import { logClients } from "../lib/logging";

export const handleInit = async (socket: WebSocket, payload: InitRequest, clients: Map<WebSocket, Client>) => {
    const { chatId, token } = payload;
    let userId = null;
    let username = null;
    try {
        const decodedToken = jwt.verify(token, "SECRET") as TokenPayload;
        if (!decodedToken) {
            throw new Error('Token verify failed');
        }
        userId = decodedToken.id;
        username = decodedToken.username;

        const result = await db.query(
            `SELECT EXISTS (
               SELECT 1 FROM chat_users WHERE chat_id = $1 AND user_id = $2
             ) AS exists`,
            [chatId, userId]
        );
        const { exists } = result.rows[0];
        if (!exists) {
            throw new Error('User is not a member of the chat');
        }
    } catch (error) {
        console.error('Token error:', error);
        socket.close(4000, 'Invalid token');
        return;
    }


    clients.set(socket, { userId, username, chatId });
    logClients(true, clients);

    const dbMessages: Message[] = await db.query(`
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