import { Client } from "../data/types";
import { WebSocket } from "ws";

export const logClients = (connected: boolean, clients: Map<WebSocket, Client>) => {
    const names = Array.from(clients.values()).map((client) => client.username || "unknown");
    const namesString = `[${names.join(", ")}]`;
    const action = connected ? "+" : "-";
    console.log(`${namesString} (${action})`);
}