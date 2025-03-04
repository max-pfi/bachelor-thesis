import { WebSocket, WebSocketServer } from "ws";
import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';
import { Client, IdPayload, Message } from "./data/types";
import { handleInit } from "./handlers/handleInit";
import { PORT } from "./data/const";
import { pgoutputPlugin, replicationService } from "./db/replicationService";

// WS SERVER
const clients = new Map<WebSocket, Client>();
const ws = new WebSocketServer({ port: PORT });

ws.on('connection', (socket) => {
    // give user a unique id for the session and add to clients map
    const clientId = uuidv4();
    clients.set(socket, { clientId, userName: null });

    // send the client their id for all future messages
    const idPayload : IdPayload = { userId: clientId };
    socket.send(JSON.stringify({ type: 'id', payload: idPayload }));

    socket.on('message', (message) => {
        const data = JSON.parse(message.toString());
        switch (data.type) {
            case 'init':
                handleInit(socket, data.payload, clients);
                logClients();
                break;
            default:
                console.error('Unknown message type:', data.type);
        }
    });
    socket.on('close', () => {
        clients.delete(socket);
        logClients();
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
    const { msg, username, ref_id } = log.new;
    const message : Message = { user: username, msg, refId: ref_id };
    clients.forEach((_, socket) => {
        socket.send(JSON.stringify({ type: 'msg', payload: message }));
    });
   }
});



const logClients = () => {
    const clientList = Array.from(clients.values()).map((client) => {
        if(client.userName) {
            return client.userName;
        } else {
            return client.clientId.slice(0, 4);
        }
    });
    console.log("Clients: ", clientList.join(", "));
}