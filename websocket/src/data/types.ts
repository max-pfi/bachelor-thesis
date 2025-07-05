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
    lastInitId?: number,
}


export type TokenPayload = {
    id: number;
    username: string;
}

export type ChangeType = "insert" | "update" | "delete";