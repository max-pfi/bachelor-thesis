import ws from 'k6/ws';
import { Options } from 'k6/options';

export const SOCKET_URL = 'ws://localhost:8080';
const startTime = Date.now();

export const options: Options = {
    stages: [
        { duration: '10s', target: 10 },
        { duration: '10s', target: 10 },
        { duration: '10s', target: 0 },
    ],
    
}

export default function () {
    const params = { tags: { my_tag: 'hello' } };
    const userId = Math.floor(Math.random() * 1000);

    const res = ws.connect(SOCKET_URL, params, function (socket) {
        socket.on('open', () => {
            console.log(`Connected ${userId}`);
            socket.setInterval(() => {
                if(Date.now() > startTime + 30000) {
                    socket.close();
                }
            }, 1000);
        });
        socket.on('message', (data) => console.log(`Message ${userId}: ${data}`));	
        socket.on('close', () => console.log(`Disconnected ${userId}`));
    });
}