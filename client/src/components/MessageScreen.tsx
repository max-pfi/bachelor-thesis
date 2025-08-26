import { Message } from "../data/types";
import { SERVER_URL } from "../data/const";
import { v4 as uuidv4 } from 'uuid';
import { AuthState } from "../providers/AuthProvider";
import Container from "./Container";
import { useState } from "react";

export const MessageScreen = (props: {
    messages: Message[];
    newMessage: string;
    setNewMessage: (msg: string) => void;
    listRef: React.RefObject<HTMLDivElement | null>
    chatId: number | null;
    authState: AuthState;
}) => {
    const { messages, newMessage, setNewMessage, listRef, chatId, authState } = props;

    const [editing, setEditing] = useState<Message | null>(null);

    const sendMessage = (msg: string) => {
        if (msg.trim() === '') return;
        const id = uuidv4();
        const message = { msg: msg, refId: id, chatId: chatId };
        fetch(`${SERVER_URL}/messages`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        }).then((res) => {
            if (!res.ok) {
                window.alert('Failed to send message');
            } else {
                setNewMessage('');
            }
        }).catch((e) => {
            console.error(e);
            window.alert('Failed to send message');
        });
    }

    const updateMessage = () => {
        if(newMessage.trim() === '' || editing === null) return;
        const updatedMessage = { 
            msg: newMessage
         };
        fetch(`${SERVER_URL}/messages/${editing.id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedMessage),
        }).then((res) => {
            if (!res.ok) {
                window.alert('Failed to update message');
            } else {
                setEditing(null);
                setNewMessage('');
            }
        }).catch((e) => {
            console.error(e);
            window.alert('Failed to update message');
        });
    }

    const deleteMessage = (id: number) => {
        setEditing(null);
        setNewMessage('');
        fetch(`${SERVER_URL}/messages/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        }).then((res) => {
            if (!res.ok) {
                window.alert('Failed to delete message');
            }
        }).catch((e) => {
            console.error(e);
            window.alert('Failed to delete message');
        });
    }

    const onEditMessage = (message: Message) => {
        setEditing(message);
        setNewMessage(message.msg);
    }

    const onCancelEditing = () => {
        setEditing(null);
        setNewMessage('');
    }

    return (

        <Container>
            <div className='flex flex-col max-h-full overflow-y-auto pb-10 scrollbar-hide' ref={listRef}>
                {messages.map((message, index) => {
                    const isOwnMessage = message.userId == authState.id;
                    return (
                        <div key={index} className={`w-full flex flex-col my-2 ${isOwnMessage ? "items-end" : "items-start"}`}>
                            <div className={`${isOwnMessage ? "bg-message-me" : "bg-message"} px-4 py-2 rounded-xl w-[80%]`}>
                                {message.msg}
                            </div>
                            {
                                isOwnMessage && (
                                    <div>
                                        <button onClick={() => onEditMessage(message)} className="text-xs btn-hover text-gray-500 px-2">
                                            Edit
                                        </button>
                                        <span className="text-xs text-gray-500">|</span>
                                        <button onClick={() => deleteMessage(message.id)} className="text-xs btn-hover text-gray-500 px-2">
                                            Delete
                                        </button>
                                    </div>
                                )
                            }
                        </div>
                    )
                })}
            </div>
            <div className="w-full absolute bottom-4 left-0 px-6">
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button
                        className="btn"
                        onClick={() => {
                            if (editing) {
                                updateMessage();
                            } else {
                                sendMessage(newMessage);
                            }
                        }}
                    >
                        {editing ? 'Update' : 'Send'}
                    </button>
                    {
                        editing && (
                            <button onClick={onCancelEditing} className="btn bg-gray-700">
                                Cancel
                            </button>
                        )
                    }
                </div>
            </div>
        </Container>
    )
}