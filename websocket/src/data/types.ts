export type Client = {
    clientId: string,
    userName: string | null,
}

export type Message = {
    user: string,
    msg: string,
    refId: string,
}

export type rawName = {
    name: string
}

export type initPayload = {
    name?: string,
    error?: string
    messages: Message[]
}

export type IdPayload = {
    userId: string
}
