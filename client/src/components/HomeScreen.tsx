import { useAuth } from "../providers/AuthProvider";
import AppScreen from "./AppScreen";

export default function HomeScreen() {
    const { logout } = useAuth();
    return (
        <AppScreen>
            <div>
                <h1>Home Screen</h1>
                <button onClick={logout}>Logout</button>

            </div>
        </AppScreen>
    )
}