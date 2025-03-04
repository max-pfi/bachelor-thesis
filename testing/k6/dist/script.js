"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = exports.SOCKET_URL = void 0;
exports.default = default_1;
const ws_1 = __importDefault(require("k6/ws"));
exports.SOCKET_URL = 'ws://localhost:8080';
const startTime = Date.now();
exports.options = {
    stages: [
        { duration: '10s', target: 10 },
        { duration: '10s', target: 10 },
        { duration: '10s', target: 0 },
    ],
};
function default_1() {
    const params = { tags: { my_tag: 'hello' } };
    const userId = Math.floor(Math.random() * 1000);
    const res = ws_1.default.connect(exports.SOCKET_URL, params, function (socket) {
        socket.on('open', () => {
            console.log(`Connected ${userId}`);
            socket.setInterval(() => {
                if (Date.now() > startTime + 30000) {
                    socket.close();
                }
            }, 1000);
        });
        socket.on('message', (data) => console.log(`Message ${userId}: ${data}`));
        socket.on('close', () => console.log(`Disconnected ${userId}`));
    });
}
