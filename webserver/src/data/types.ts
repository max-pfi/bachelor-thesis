
export type Chat = {
    id: number;
    name: number;
}

export type User = {
    id: number;
    username: string;
    password_hash: string;
};

export type TokenPayload = {
    id: number;
    username: string;
}