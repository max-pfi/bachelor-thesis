export type MessageType = "id" | "msg" | "init";
export type ServerState = "CLOSED" | "LOADING" | "OPEN";
export type IdPayload = {
  userId: string;
}
export type Message = {
  user: string;
  msg: string;
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