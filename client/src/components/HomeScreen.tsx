import { useNavigate } from "react-router";
import { useChats } from "../hooks/useChats";
import { useAuth } from "../providers/AuthProvider";
import AppScreen from "./AppScreen";
import Container from "./Container";
import { ContainerHeader } from "./ContainerHeader";

export default function HomeScreen() {
    const { logout } = useAuth();
    const { chats, loading, error, fetchChats } = useChats();
    const navigate = useNavigate();

    function onChatClick(chatId: number, chatName: string) {
        navigate(`/chat/${chatId}`, { state: { chatName }});
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
                                <div onClick={() => { onChatClick(chat.id, chat.name) }} className="p-4 rounded-xl bg-message cursor-pointer hover:scale-101 transition-transform duration-200">
                                    <h2 className="text-xl font-medium">{chat.name}</h2>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Container>
        </AppScreen>
    )
}