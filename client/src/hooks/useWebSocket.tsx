import { useEffect, useState } from "react";
import { Message, MessageData, User } from "../data/types";
import { useSocketConnection } from "./useSocketConnection";
import { handleMessage } from "../handlers/messageHandler";

export const useWebSocket = () => {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [nameTaken, setNameTaken] = useState<boolean>(false);

  const clearData = () => {
    setUser(null);
    setNameTaken(false);
    setMessages([]);
  }

  const onMessage = (data: MessageData) => {
    handleMessage(
      data,
      setUser,
      setMessages,
      setNameTaken,
    )
  }

  const { readyState, connectToServer, server } = useSocketConnection(onMessage, clearData);

  // SEND DATA
  const sendInit = (name: string) => {
    if (server.current) {
      setNameTaken(false);
      server.current.send(JSON.stringify({ type: 'init', payload: { name: name } }));
    }
  }

  const sendMessage = (message: string) => {
    if (server.current) {
      server.current.send(JSON.stringify({ type: 'msg', payload: { message: message } }));
    }
  }

  // intial connection
  useEffect(() => {
    connectToServer();
  }, [connectToServer]);

  return { messages, user, sendMessage, connectToServer, sendInit, nameTaken, readyState };
}