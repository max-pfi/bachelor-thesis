import { useAuth } from "../providers/AuthProvider";
import AppScreen from "./AppScreen";

export default function HomeScreen() {
    const { logout } = useAuth();
    return (
        <AppScreen>
            <div className="flex flex-row justify-between w-container items-baseline px-4 py-2">
            <h1 className="text-4xl font-medium">Chats</h1>
            <button onClick={logout} className="btn-hover opacity-50">Logout</button>
            </div>
            <div className='w-container bg-container h-1/2 rounded-2xl'>
            </div>
        </AppScreen>
    )
}