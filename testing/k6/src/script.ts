import ws from 'k6/ws';
import http from 'k6/http';
import { Options } from 'k6/options';
import { Trend } from 'k6/metrics';
import crypto from 'k6/crypto';
import encoding from 'k6/encoding';

type MessageType = "id" | "msg" | "init";

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
    payload: IdPayload | Message | InitPayload;
}
export type User = {
    id: string;
    name: string | null;
}


const SOCKET_URL = 'ws://localhost:8080';
const SERVER_URL = 'http://localhost:3000';
const START_TIME = Date.now();

// config
const PHASE_RAMP_UP = 10;
const PHASE_MESSAGE = 30;
const PHASE_RAMP_DOWN = 5;
const USER_COUNT = 30;
const FULL_DURATION = PHASE_RAMP_UP + PHASE_MESSAGE + PHASE_RAMP_DOWN;
const TEST_DURATION = PHASE_RAMP_UP + PHASE_MESSAGE;

const TEST_CHAT_ID = 1; // the chat id to use for the test

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

    const receivedMessages: string[] = [];

    ws.connect(SOCKET_URL, {}, function (socket) {
        socket.on('open', () => {
            socket.send(JSON.stringify({ type: 'init', payload: { chatId: TEST_CHAT_ID, token: jwt } }))
            // close the connection after the test duration
            socket.setInterval(() => {
                if (Date.now() > (START_TIME + FULL_DURATION * 1000) + userId * 300) {
                    socket.close()
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
                    for(const msg of messages) {
                        receivedMessages.push(msg.id.toString());
                    }
                    sendMessages(socket, userName, jwt)
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
            }
        });
        socket.on('close', () => {
            console.log(`[MSG_LOG] messages=[${receivedMessages.join(',')}]`);
        })
        socket.on('error', (e) => {
            if (e.error() != 'websocket: close sent') {
                console.error('Error: ', e.error())
            }
        });
    });
}


// sends messages in a random interval between 1 and 5 seconds as long as the test is running
function sendMessages(socket: any, username: string, jwt: string) {
    socket.setInterval(() => {
        if (Date.now() > START_TIME + TEST_DURATION * 1000) {
            return;
        }
        const randomTestMsg = Math.random().toString(36).substring(7)
        const refId = username + encoding.b64encode(crypto.randomBytes(16))
        const message = JSON.stringify({ msg: randomTestMsg, refId, chatId: TEST_CHAT_ID })
        sentMessages.set(refId, Date.now())
        const res = http.post(`${SERVER_URL}/messages`, message, {
            headers: { 'Content-Type': 'application/json', Cookie: `token=${jwt}`, },
        });
        if (res.status !== 201) {
            console.error('Failed to send message', res.status)
        }
    }, Math.random() * 4000 + 1000) // random interval between 1-5 seconds
}