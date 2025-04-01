export type Message = {
    username: string,
    userId: number,
    msg: string,
    refId: string,
}

export type InitRequest = {
    chatId: number
}

export type initPayload = {
    messages: Message[]
}

export type IdPayload = {
    userId: string
}

export type Client = {
    chatId: number | null,
}
