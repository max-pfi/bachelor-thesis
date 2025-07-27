import ws from 'k6/ws';
import http from 'k6/http';
import { Options } from 'k6/options';
import { Trend } from 'k6/metrics';
import crypto from 'k6/crypto';
import encoding from 'k6/encoding';

type MessageType = "id" | "msg" | "init" | "stoppedTracking";

export type IdPayload = {
    userId: string;
}
export type Message = {
    id: number,
    username: string,
    userId: number,
    chatId: number,
    msg: string,
    refId: string,
    updatedAt: Date,
    createdAt: Date,
}
export type InitPayload = {
    messages: Message[];
}
export type MessageData = {
    type: MessageType;
    payload: IdPayload | Message | InitPayload | Stats;
}

export type Stats = {
    averageQueueSize: number;
    peakQueueSize: number;
    messageErrors: number;
    closedClients: number;
}

export type User = {
    id: string;
    name: string | null;
}

// general config
export const SOCKET_URL = 'ws://localhost:8080';
export const SERVER_URL = 'http://localhost:3000';


// Test specific config
export const USER_COUNT = __ENV.USER_COUNT ? parseInt(__ENV.USER_COUNT) : 25;
export const CHAT_COUNT = __ENV.CHAT_COUNT ? parseInt(__ENV.CHAT_COUNT) : 5;

let PHASE_IDLE = 0;
if (USER_COUNT <= 50) {
    PHASE_IDLE = 30
} else if (USER_COUNT <= 250) {
    PHASE_IDLE = 70
} else {
    PHASE_IDLE = 200
}


export const PHASE_RAMP_UP = 20;
export const PHASE_MESSAGE = 30;
export const TEST_DURATION = PHASE_RAMP_UP + PHASE_MESSAGE;
export const FULL_DURATION = PHASE_RAMP_UP + PHASE_MESSAGE + PHASE_IDLE;
export const MSG_INTERVAL = 12000; // interval in ms to send messages (+/- 500ms)

const START_TIME = Date.now();

const tokenMap = JSON.parse(open('./tokens.json')) as Record<string, string>;

export const options: Options = {
    scenarios: {
        websocket_load: {
            executor: 'ramping-vus',
            startVUs: 0,
            gracefulStop: `100s`,
            gracefulRampDown: `100s`,
            stages: [
                { duration: `${PHASE_RAMP_UP}s`, target: USER_COUNT },
                { duration: `${PHASE_MESSAGE + PHASE_IDLE}s`, target: USER_COUNT },
            ],
        },
    },
};

export const msgLatency = new Trend('msg_latency', true);

const sentMessages = new Map<string, number>();

export default function () {
    const userId = __VU;
    const userName = `user-${userId}`
    const jwt = tokenMap[userId]

    const chatId = ((userId - 1) % CHAT_COUNT) + 1;


    const receivedMessages: string[] = [];

    ws.connect(SOCKET_URL, {}, function (socket) {
        socket.on('open', () => {
            socket.send(JSON.stringify({ type: 'init', payload: { chatId: chatId, token: jwt } }))
            const disconnectDelay = (FULL_DURATION * 1000) + userId * 5
            const stopTrackingDelay = (TEST_DURATION * 1000 + (PHASE_IDLE * 1000 / 2))
            if (userId === 1) {
                socket.setTimeout(() => {
                    socket.send(JSON.stringify({ type: 'stopTracking' }));
                }, stopTrackingDelay)
            }
            socket.setTimeout(() => {
                socket.close();
            }, disconnectDelay);

        });
        socket.on('message', (data) => {
            const now = Date.now();
            const message: MessageData = JSON.parse(data)
            switch (message.type) {
                case 'id':
                    socket.send(JSON.stringify({ type: 'init', payload: { name: userName } }))
                    break;
                case 'init':
                    const { messages } = message.payload as InitPayload
                    for (const msg of messages) {
                        receivedMessages.push(msg.id.toString());
                    }
                    // wait 500 ms before sending the first message
                    // it would technically not be a problem but after sending the init message, the server pauses 300ms
                    // sending a message immediately would negatively impact the latency measurement (even if the order would be correct)
                    socket.setTimeout(() => {
                        sendMessages(socket, userName, jwt, chatId)
                    }, 500)

                    if (userId === 1) {
                        // start tracking the queue of the changeHandler, when the first user connects
                        socket.send(JSON.stringify({ type: 'startTracking' }))
                    }
                    break;
                case 'msg':
                    // log latency of message
                    const { refId, id } = message.payload as Message
                    const sentAt = sentMessages.get(refId)
                    receivedMessages.push(id.toString());
                    if (sentAt && refId.startsWith(userName)) {
                        const latency = now - sentAt
                        msgLatency.add(latency)
                        sentMessages.delete(refId)
                    }
                    break;
                case 'stoppedTracking':
                    const stats = message.payload as Stats;
                    console.log(`[STATS_LOG] avgQueue=${stats.averageQueueSize.toFixed(2)},peakQueue=${stats.peakQueueSize},messageErrors=${stats.messageErrors},closedClients=${stats.closedClients}`);
                    break;
            }
        });
        socket.on('close', () => {
            console.log(`[MSG_LOG] chatId=${chatId} messages=[${receivedMessages.join(',')}]`);
        })
        socket.on('error', (e) => {
            if (e.error() != 'websocket: close sent') {
                console.error('Error: ', e.error())
            }
        });
    });
}


// sends messages in a random interval between 1 and 5 seconds as long as the test is running
function sendMessages(socket: any, username: string, jwt: string, chatId: number) {
    socket.setInterval(() => {
        if (Date.now() > START_TIME + TEST_DURATION * 1000) {
            return;
        }
        const randomTestMsg = Math.random().toString(36).substring(7)
        const refId = username + encoding.b64encode(crypto.randomBytes(16))
        const message = JSON.stringify({ msg: randomTestMsg, refId, chatId: chatId })
        sentMessages.set(refId, Date.now())
        const res = http.post(`${SERVER_URL}/messages`, message, {
            headers: { 'Content-Type': 'application/json', Cookie: `token=${jwt}`, },
        });
        if (res.status !== 201) {
            console.error('Failed to send message', res.status)
        }
    }, MSG_INTERVAL + (Math.random() * 1000 - 500))
}