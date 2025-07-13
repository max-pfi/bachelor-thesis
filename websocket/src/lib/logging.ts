import { Client } from "../data/types";
import { WebSocket } from "ws";

export const logClients = (connected: boolean, clients: Map<WebSocket, Client>) => {
    console.log('Client count: ', clients.size);
    return
    const names = Array.from(clients.values()).map((client) => client.username || "unknown");
    const namesString = `[${names.join(", ")}]`;
    const action = connected ? "+" : "-";
    console.log(`${namesString} (${action})`);
}