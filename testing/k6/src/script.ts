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
}

export type User = {
    id: string;
    name: string | null;
}

// general config
export const SOCKET_URL = 'ws://localhost:8080';
export const SERVER_URL = 'http://localhost:3000';


// Test specific config
export const USER_COUNT = 25;
export const CHAT_COUNT = 5;

export const PHASE_RAMP_UP = 10;
export const PHASE_MESSAGE = 30;
export const PHASE_RAMP_DOWN = 5;
export const FULL_DURATION = PHASE_RAMP_UP + PHASE_MESSAGE + PHASE_RAMP_DOWN;
export const TEST_DURATION = PHASE_RAMP_UP + PHASE_MESSAGE;
export const MSG_INTERVAL = 12000; // interval in ms to send messages (+/- 500ms)

const START_TIME = Date.now();

const tokenMap = JSON.parse(open('./tokens.json')) as Record<string, string>;

export const options: Options = {
    stages: [
        { duration: `${PHASE_RAMP_UP}s`, target: USER_COUNT }, // accumulate users
        { duration: `${PHASE_MESSAGE}s`, target: USER_COUNT }, // send
        { duration: `${PHASE_RAMP_DOWN}s`, target: 0 },
    ],

}

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
            // close the connection after the test duration
            socket.setInterval(() => {
                if (Date.now() > (START_TIME + FULL_DURATION * 1000) + userId * 300) {
                    if (userId === USER_COUNT) {
                        // the last user will send a message to stop tracking the queue
                        // only when the signal is received will the test end
                        socket.send(JSON.stringify({ type: 'stopTracking' }))
                    } else {
                        socket.close()
                    }

                }
            }, 1000)
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
                    console.log(`[STATS] Average queue size: ${stats.averageQueueSize}, Peak queue size: ${stats.peakQueueSize}`);
                    socket.close();
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