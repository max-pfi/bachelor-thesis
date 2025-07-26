import { ChangeType, Client, Message, Stats } from "../data/types";
import { WebSocket } from "ws";

let messageErrors = 0;
let closedClients = 0;

// used to save the last changes and correctly submit previous changes to newly connected clients
const changeBuffer: { type: ChangeType, payload: Message }[] = []

async function changeHandler({ type, payload, clients }: { type: ChangeType, payload: Message, clients: Map<WebSocket, Client> }) {
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
        const socketsToDeconnect: WebSocket[] = [];

        const bufferedIds = new Set(changeBuffer.map(c => c.payload.id));

        await Promise.all(
            Array.from(clients.entries()).map(async ([socket, client]) => {
                if (client.userId && client.lastChangeId !== undefined && (bufferedIds.has(client.lastChangeId) || client.lastChangeId === 0)) {
                    // when the userId and the lastChangeId are set it means the client has already received the initial messages
                    // all changes after the lastChangeId need to be sent
                    // 0 is for clients that have been initialized but there are not messages yet
                    // in this case the bufferedIds will not contain the lastChangeId but we still want to send the changes
                    const bufferedChanges = changeBuffer.filter(change => change.payload.id > client.lastChangeId!);
                    let newLastChangeId = client.lastChangeId!;
                    for (const change of bufferedChanges) {
                        if (client.chatId === change.payload.chatId) {
                            try {
                                await new Promise<void>((resolve, reject) => {
                                    socket.send(JSON.stringify({ type: "msg", payload: change.payload }), (err) => {
                                        if (err) {
                                            reject(err)
                                        } else {
                                            resolve()
                                        }
                                    });
                                });
                                newLastChangeId = change.payload.id // only if successful
                            } catch (err) {
                                // on error the current message batch is not sent and the initId is not updated
                                // on the next change it will be retried
                                messageErrors++
                                break
                            }
                        }
                    }
                    updates.push([socket, { ...client, lastChangeId: newLastChangeId }]);
                } else if (client.userId && client.lastChangeId !== undefined && !bufferedIds.has(client.lastChangeId)) {
                    // this means the client has beein initialiezd but the lastChangeId is not in the buffer
                    // either sending messages has failed repeatedly or anything else went wrong
                    // in this case we deconnect the client
                    socketsToDeconnect.push(socket);
                }
            })
        );

        // update the clients map with the new lastChangeId
        for (const [socket, updatedClient] of updates) {
            clients.set(socket, updatedClient);
        }
        for (const socket of socketsToDeconnect) {
            closedClients++;
            socket.close(4000, 'Invalid lastChangeId');
        }
    }
}

let processingChangeHandler = Promise.resolve();
let currentQueueSize = 0;
let totalQueueSize = 0;
let queueCount = 0;
let peakQueueSize = 0;

export function queueChangeHandler(type: ChangeType, payload: Message, clients: Map<WebSocket, Client>) {
    currentQueueSize++;
    totalQueueSize += currentQueueSize;
    queueCount++;
    if (currentQueueSize > peakQueueSize) {
        peakQueueSize = currentQueueSize;
    }
    processingChangeHandler = processingChangeHandler.then(() => changeHandler({ type, payload, clients })).finally(() => {
        currentQueueSize--;
        if (currentQueueSize < 0) {
            currentQueueSize = 0;
        }
    });
}

export function getStats(): Stats {
    return {
        averageQueueSize: queueCount === 0 ? 0 : totalQueueSize / queueCount,
        peakQueueSize,
        messageErrors,
        closedClients,
    };
}

export function startTracking() {
    currentQueueSize = 0;
    totalQueueSize = 0;
    queueCount = 0;
    peakQueueSize = 0;
    messageErrors = 0;
    closedClients = 0;
}