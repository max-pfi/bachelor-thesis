import { useNavigate } from "react-router";
import { useChats } from "../hooks/useChats";
import { useAuth } from "../providers/AuthProvider";
import AppScreen from "./AppScreen";

export default function HomeScreen() {
    const { logout } = useAuth();
    const { chats, loading, error, fetchChats } = useChats();
    const navigate = useNavigate();

    function onChatClick(chatId: number) {
        navigate(`/chat/${chatId}`);
    }

    return (
        <AppScreen>
            <div className="flex flex-row justify-between w-container items-baseline px-4 py-2">
                <h1 className="text-4xl font-medium">Chats</h1>
                <button onClick={logout} className="btn-hover opacity-50">Logout</button>
            </div>
            <div className='w-container bg-container h-1/2 rounded-2xl'>
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
                    <div className="flex flex-col gap-2 p-4">
                        {chats.map((chat) => (
                            <div key={chat.id} onClick={() => {onChatClick(chat.id)}} className="p-4 rounded-xl bg-message cursor-pointer hover:scale-101 transition-transform duration-200">
                                <h2 className="text-xl font-medium">{chat.name}</h2>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppScreen>
    )
}