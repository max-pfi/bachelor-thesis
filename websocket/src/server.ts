import { WebSocket, WebSocketServer } from "ws";
import 'dotenv/config';
import { Client } from "./data/types";
import { PORT } from "./data/const";
import { handleInit } from "./handlers/handleInit";
import { logClients } from "./lib/logging";
import { startReplicationService } from "./cdc/logBased/replicationService";

// WS SERVER
const clients = new Map<WebSocket, Client>();
const ws = new WebSocketServer({ port: PORT });

ws.on('connection', (socket) => {
    clients.set(socket, { userId: null, username: null, chatId: null });
    logClients(true, clients);

    socket.on('message', (message) => {
        const data = JSON.parse(message.toString());
        switch (data.type) {
            case 'init':
                handleInit(socket, data.payload, clients)
                break;
            default:
                console.error('Unknown message type:', data.type);
        }
    });

    socket.on('close', () => {
        clients.delete(socket);
        logClients(false, clients);
    });
})

ws.on("listening", () => {
    console.log(`Server started on port ${PORT}`);
})

ws.on("close", () => {
    console.log("Server closed");
})

switch (process.env.CDC_TYPE) {
    case "replication":
        startReplicationService({ clients })
        break;
    default:
        console.error("Unknown CDC type. Set CDC_TYPE to a correct value");
        break;
}
