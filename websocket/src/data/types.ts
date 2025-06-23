export type Message = {
    username: string,
    userId: number,
    msg: string,
    refId: string,
}

export type InitRequest = {
    token: string,
    chatId: number
}

export type initPayload = {
    messages: Message[]
}

export type IdPayload = {
    userId: string
}

export type Client = {
    userId: number | null,
    username: string | null,
    chatId: number | null,
}


export type TokenPayload = {
    id: number;
    username: string;
}