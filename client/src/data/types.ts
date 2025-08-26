export type MessageType = "id" | "msg" | "init" | "update";
export type ServerState = "CLOSED" | "LOADING" | "CONNECTING" | "OPEN";
export type IdPayload = {
  userId: string;
}
export type Message = {
  id: number,
  username: string,
  userId: number,
  msg: string,
  refId: string,
  deleted: boolean,
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

export type Chat = {
  id: number;
  name: string;
  isInChat: boolean;
}