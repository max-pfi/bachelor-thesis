import { WebSocket, WebSocketServer } from "ws";
import 'dotenv/config';
import { Client } from "./data/types";
import { PORT } from "./data/const";
import { handleInit } from "./handlers/handleInit";
import { logClients } from "./lib/logging";
import { startReplicationService } from "./cdc/logBased/replicationService";
import { startTimestampService } from "./cdc/timestampBased/timeStampService";
import { startTriggerBasedService } from "./cdc/triggerBased/triggerService";
import { getStats, startTracking } from "./cdc/changeHandler";

// WS SERVER
const clients = new Map<WebSocket, Client>();
const ws = new WebSocketServer({ port: PORT });

ws.on('connection', (socket) => {
    clients.set(socket, { userId: null, username: null, chatId: null });

    socket.on('message', (message) => {
        const data = JSON.parse(message.toString());
        switch (data.type) {
            case 'init':
                handleInit(socket, data.payload, clients)
                break;
            case 'startTracking':
                startTracking();
                break;
            case 'stopTracking':
                const stats = getStats();
                socket.send(JSON.stringify({ type: 'stoppedTracking', payload: stats }));
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
    case "timestamp":
        startTimestampService({ clients })
        break;
    case "trigger":
        startTriggerBasedService({ clients })
        break;
    default:
        console.error("Unknown CDC type. Set CDC_TYPE to a correct value");
        break;
}
