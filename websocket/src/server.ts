import { WebSocket, WebSocketServer } from "ws";
import 'dotenv/config';
import { Client, Message } from "./data/types";
import { PORT } from "./data/const";
import { pgoutputPlugin, replicationService } from "./db/replicationService";
import { handleInit } from "./handlers/handleInit";

// WS SERVER
const clients = new Map<WebSocket, Client>();
const ws = new WebSocketServer({ port: PORT });

ws.on('connection', (socket) => {
    clients.set(socket, { chatId: null});

    socket.on('message', (message) => {
        const data = JSON.parse(message.toString());
        switch (data.type) {
            case 'init':
                handleInit(socket, data.payload, clients);
                logClients(true);
                break;
            default:
                console.error('Unknown message type:', data.type);
        }
    });

    socket.on('close', () => {
        clients.delete(socket);
        logClients(false);
    });
})

ws.on("listening", () => {
    console.log(`Server started on port ${PORT}`);
})

ws.on("close", () => {
    console.log("Server closed");
})


// REPLICATION SERVICE
const slotName = process.env.REPLICATION_SLOT ?? "";
replicationService.subscribe(pgoutputPlugin, slotName);

replicationService.on('data', (_, log) => {
   if(log.tag === "insert") {
    const { msg, user_id, chat_id, ref_id } = log.new;
    const message : Message = { userId: user_id, username: "default", msg, refId: ref_id }; // todo: get username from db
    clients.forEach((chatId, socket) => {
        if(chatId. chatId === chat_id) {
            socket.send(JSON.stringify({ type: 'msg', payload: message }));
        }
    });
   }
});



const logClients = (connected: boolean) => {
    const numberOfClients = clients.size;
    console.log(`Number of clients: ${numberOfClients} (${connected ? 'connected' : 'disconnected'})`);
}