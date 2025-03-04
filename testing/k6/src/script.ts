import ws from 'k6/ws';
import http from 'k6/http';
import { Options } from 'k6/options';
import { sleep } from 'k6';
import { Trend } from 'k6/metrics';
import crypto from 'k6/crypto';

type MessageType = "id" | "msg" | "init";

export type IdPayload = {
    userId: string;
}
export type Message = {
    user: string;
    msg: string;
    refId: string;
}
export type InitPayload = {
    name?: string;
    error?: string;
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
const USER_COUNT = 10;
const FULL_DURATION = PHASE_RAMP_UP + PHASE_MESSAGE + PHASE_RAMP_DOWN;
const TEST_DURATION = PHASE_RAMP_UP + PHASE_MESSAGE;

export const options: Options = {
    stages: [
        { duration: `${PHASE_RAMP_UP}s`, target: USER_COUNT }, // accumulate users
        { duration: `${PHASE_MESSAGE}s`, target: USER_COUNT }, // send
        { duration: `${PHASE_RAMP_DOWN}s`, target: 0 },
    ],

}

export const msgLatency = new Trend('msg_latency');

const sentMessages = new Map<string, number>();

export default function () {
    const userId = __VU;
    const userName = `user-${userId}`;

    ws.connect(SOCKET_URL, {}, function (socket) {
        socket.on('open', () => {
            // close the connection after the test duration
            socket.setInterval(() => {
                if (Date.now() > (START_TIME + FULL_DURATION * 1000) + userId * 300) {
                    socket.close();
                }
            }, 1000);
        });
        socket.on('message', (data) => {
            const now = Date.now();
            const message: MessageData = JSON.parse(data);
            switch (message.type) {
                case 'id':
                    socket.send(JSON.stringify({ type: 'init', payload: { name: userName } })); // send the username
                    break;
                case 'init':
                    const { name, error } = message.payload as InitPayload;
                    if (error || !name) {
                        console.log('Name taken:', error);
                    } else {
                        sendMessages(userName);
                    }
                    break;
                case 'msg':
                    const { refId } = message.payload as Message;
                    const sentAt = sentMessages.get(refId);
                    if (sentAt) {
                        const latency = now - sentAt;
                        msgLatency.add(latency);
                        sentMessages.delete(refId);
                    }
                    break;
            }
        });
        socket.on('close', () => console.log(`Disconnected ${userId}`));
        socket.on('error', (e) => {
            if (e.error() != 'websocket: close sent') {
                console.error('Error: ', e.error());
            }
        });
    });
}


// sends messages in a random interval between 1 and 5 seconds as long as the test is running
function sendMessages(username: string) {
    while (Date.now() <= START_TIME + TEST_DURATION * 1000) {
        const randomTestMsg = Math.random().toString(36).substring(7);
        const id = crypto.randomBytes(32).toString();
        const message = { user: username, msg: randomTestMsg, refId: id };
        sentMessages.set(id, Date.now());
        const res = http.post(`${SERVER_URL}/messages`, JSON.stringify(message), {
            headers: { 'Content-Type': 'application/json' },
        });
        if (res.status !== 201) {
            console.error('Failed to send message', res.status);
        }
        sleep(Math.random() * 4 + 1);
    }
}