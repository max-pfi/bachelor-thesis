import { InitPayload, Message, MessageData } from "../data/types";


export const handleMessage = (
    data: MessageData,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
) => {
    switch (data.type) {
        case 'init':
            handleInit(data.payload as InitPayload, setMessages);
            break;
        case 'msg':
            handleMsg(data.payload as Message, setMessages);
            break;
    }
}

const handleInit = (data: InitPayload,
    setMessages: (messages: Message[]) => void,
) => {
    setMessages(data.messages);
}

const handleMsg = (message: Message,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
) => {
    setMessages((prev) => [...prev, message]);
}
