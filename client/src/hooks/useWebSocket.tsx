import { useEffect, useState } from "react";
import { Message, MessageData } from "../data/types";
import { useSocketConnection } from "./useSocketConnection";
import { handleMessage } from "../handlers/messageHandler";

export const useWebSocket = (
  chatId: number | null,
) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const clearData = () => {
    setMessages([]);
  }

  const onMessage = (data: MessageData) => {
    handleMessage(
      data,
      setMessages,
    )
  }

  const { readyState, connectToServer, server } = useSocketConnection(onMessage, clearData, chatId);

  // intial connection
  useEffect(() => {
    console.log('Initializing...');
    connectToServer();
    return () => {
      console.log('Cleaning up...');
      server.current?.close();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { messages, connectToServer, readyState };
}