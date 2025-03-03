import { IdPayload, InitPayload, Message, MessageData, User } from "../data/types";


export const handleMessage = (
    data: MessageData,
    setUser: React.Dispatch<React.SetStateAction<User | null>>,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    setNameTaken: (value: boolean) => void,
) => {
    switch (data.type) {
        case 'id':
            handleId(data.payload as IdPayload, setUser);
            break;
        case 'init':
            handleInit(data.payload as InitPayload, setUser, setMessages, setNameTaken);
            break;
        case 'msg':
            handleMsg(data.payload as Message, setMessages);
            break;
    }
}

const handleId = (
    data: IdPayload,
    setUser: React.Dispatch<React.SetStateAction<User | null>>
) => {
    setUser({ id: data.userId, name: null });
}

const handleInit = (data: InitPayload,
    setUser: React.Dispatch<React.SetStateAction<User | null>>,
    setMessages: (messages: Message[]) => void,
    setNameTaken: (value: boolean) => void,
) => {
    const { name, error } = data;
    if (error || !name) {
        console.log('Name taken:', error);
        setNameTaken(true);
    } else {
        setNameTaken(false);
        setUser((prevUser) => {
            return prevUser ? { ...prevUser, name } : null;
        });
        setMessages(data.messages);
    }
}

const handleMsg = (message: Message,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
) => {
    setMessages((prev) => [...prev, message]);
}
