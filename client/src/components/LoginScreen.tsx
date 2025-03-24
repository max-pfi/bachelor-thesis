import { useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import AppScreen from "./AppScreen";

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const { login, authState } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login(username, password);
    }

    return (
        <AppScreen>
            <form onSubmit={handleSubmit} className="login-container">
                <h1>Login</h1>
                <input type="text" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">
                    {authState.loading ? 'loading...' : 'Login'}
                </button>
            </form>
        </AppScreen>
    )
}