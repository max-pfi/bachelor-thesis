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