import { Client } from "../data/types";
import { WebSocket } from "ws";

export const logClients = (connected: boolean, size: number) => {
    if (size === 0 ||
        size === 25 ||
        size === 50 ||
        size === 250 ||
        size === 300 ||
        size === 500) {
        console.log(`Connected clients ${connected ? "+" : "-"}: ${size}`);
    }
}