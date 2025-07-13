import { ChangeType, Client, Message } from "../data/types";
import { WebSocket } from "ws";

// used to save the last changes and correctly submit previous changes to newly connected clients
const changeBuffer: { type: ChangeType, payload: Message }[] = []

function changeHandler({ type, payload, clients }: { type: ChangeType, payload: Message, clients: Map<WebSocket, Client> }) {
    if (clients.size === 0) {
        // remove everything from the buffer if there are no clients
        if (changeBuffer.length > 0) {
            changeBuffer.length = 0;
        }
        return;
    }
    // add the change to the buffer
    changeBuffer.push({ type, payload });
    if (changeBuffer.length > 200) {
        changeBuffer.splice(0, 50);
    }

    if (type === "insert") {
        const updates: [WebSocket, Client][] = [];

        clients.forEach((client, socket) => {
            if (client.lastInitId === -1) {
                // this means changes have already been sent to the client
                // only the last change needs to be sent
                sendChangesToClientsOfChat(payload, socket, client.chatId);
            } else if (client.userId && client.lastInitId !== undefined && client.lastInitId > -1) {
                // this means the client has just been initialized
                // all changes after the lastInitId need to be sent
                const bufferedChanges = changeBuffer.filter(change => change.payload.id > client.lastInitId!);
                for (const change of bufferedChanges) {
                    if (client.chatId === change.payload.chatId) {
                        socket.send(JSON.stringify({ type: "msg", payload: change.payload }));
                    }
                }
                updates.push([socket, { ...client, lastInitId: -1 }]);
            }
        });

        // update the clients map with the new lastInitId
        for (const [socket, updatedClient] of updates) {
            clients.set(socket, updatedClient);
        }

    }
}

// checks if the client should receive the change based on the chatId and sends it
function sendChangesToClientsOfChat(payload: Message, socket: WebSocket, clientChatId: number | null) {
    if (payload.chatId === clientChatId) {
        socket.send(JSON.stringify({ type: "msg", payload }));
    }
}

let processingChangeHandler = Promise.resolve();

export function queueChangeHandler(type: ChangeType, payload: Message, clients: Map<WebSocket, Client>) {
    processingChangeHandler = processingChangeHandler.then(() => changeHandler({ type, payload, clients }));
}