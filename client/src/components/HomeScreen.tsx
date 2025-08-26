import { useNavigate } from "react-router";
import { useChats } from "../hooks/useChats";
import { useAuth } from "../providers/AuthProvider";
import AppScreen from "./AppScreen";
import Container from "./Container";
import { ContainerHeader } from "./ContainerHeader";
import { useState } from "react";
import { SERVER_URL } from "../data/const";

export default function HomeScreen() {
    const { logout } = useAuth();
    const { chats, loading, error, fetchChats } = useChats();
    const navigate = useNavigate();

    const [newChatOpen, setNewChatOpen] = useState(false);
    const [newChatName, setNewChatName] = useState("");

    function onChatClick(chatId: number, chatName: string, isInChat: boolean) {
        if(!isInChat) {
            alert("You must join the chat before entering it.");
            return;
        }
        navigate(`/chat/${chatId}`, { state: { chatName } });
    }

    function onCreateChat() {
        if (newChatName.trim() === '') return;
        fetch(`${SERVER_URL}/chats`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: newChatName
            }),
        }).then((res) => {
            if (!res.ok) {
                window.alert('Failed to create chat');
            } else {
                setNewChatName("");
                setNewChatOpen(false);
                fetchChats();
            }
        }).catch((e) => {
            console.error(e);
            window.alert('Failed to create chat');
        });
    }

    function onJoin(chatId: number, event: React.MouseEvent) {
        event.stopPropagation();
        fetch(`${SERVER_URL}/chats/${chatId}/join`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((res) => {
            if (!res.ok) {
                window.alert('Failed to join chat');
            } else {
                fetchChats();
            }
        }).catch((e) => {
            console.error(e);
            window.alert('Failed to join chat');
        });
    }

    function onLeave(chatId: number, event: React.MouseEvent) {
        event.stopPropagation();
        fetch(`${SERVER_URL}/chats/${chatId}/leave`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((res) => {
            if (!res.ok) {
                window.alert('Failed to leave chat');
            } else {
                fetchChats();
            }
        }).catch((e) => {
            console.error(e);
            window.alert('Failed to leave chat');
        });
    }

    function cancelCreateChat() {
        setNewChatName("");
        setNewChatOpen(false);
    }

    return (
        <AppScreen>
            <ContainerHeader title="Chats">
                <button onClick={logout} className="btn-hover opacity-50">Logout</button>
            </ContainerHeader>
            <Container>
                {loading && (
                    <div className="flex justify-center items-center h-full w-full">
                        <p className="text-xl">Loading...</p>
                    </div>
                )}
                {error && (
                    <div className="flex flex-col justify-center gap-2 items-center h-full w-full">
                        <p className="text-xl">Error loading chats</p>
                        <button onClick={fetchChats} className="btn-hover underline">Retry</button>
                    </div>
                )}
                {!loading && !error && (
                    <div className="flex flex-col gap-2">
                        {chats.map((chat, index) => (
                            <div key={chat.id} className={`${index === 0 ? 'mt-4' : ''}`}>
                                <div onClick={() => { onChatClick(chat.id, chat.name, chat.isInChat) }} className="p-4 rounded-xl bg-message cursor-pointer hover:scale-101 transition-transform duration-200">
                                    <div className="flex flex-row justify-between">
                                        <h2 className="text-xl font-medium">{chat.name}</h2>
                                        {chat.isInChat ? (
                                            <button onClick={(event) => onLeave(chat.id, event)} className="text-sm bg-gray-600/50 px-4 rounded-md btn-hover">Leave</button>
                                        ) : (
                                            <button onClick={(event) => onJoin(chat.id, event)} className="text-sm bg-gray-600 px-4 rounded-md btn-hover">Join</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="flex flex-row justify-end px-4">
                            <button onClick={() => { setNewChatOpen(true) }} className="btn-hover opacity-50 text-md">+ New Chat</button>
                        </div>
                    </div>
                )}
            </Container>
            {
                newChatOpen && (
                    <div className="absolute w-full h-full bg-black/50">
                        <div className="flex flex-col h-full justify-center items-center">
                            <div className="flex flex-col gap-2 p-4">
                                <input
                                    type="text"
                                    placeholder="Chat Name"
                                    value={newChatName}
                                    onChange={(e) => setNewChatName(e.target.value)}
                                    className="border border-gray-300 p-2 rounded"
                                />
                                <button onClick={onCreateChat} className="btn-hover bg-gray-700 py-2 rounded-sm">Create Chat</button>
                                <button onClick={cancelCreateChat} className="btn-hover text-sm opacity-50">Cancel</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </AppScreen>
    )
}