import { useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import AppScreen from "./AppScreen";

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [registering, setRegistering] = useState(false);

    const { login, register, authState, removeError } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (registering) {
            register(username, password);
        } else {
            login(username, password);
        }
    }

    const switchMode = () => {
        setUsername('');
        setPassword('');
        removeError();
        setRegistering(!registering);
    }

    return (
        <AppScreen>
            <div className="flex flex-col gap-4">
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-[500px]">
                    <h1 className="text-2xl font-bold">{registering ? "Register" : "Login"}</h1>
                    {authState.error && <div className="px-4 py-2 bg-error rounded-xl">{authState.error}</div>}
                    <input type="text" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <input type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="submit" className="btn">
                        {authState.loading ? 'loading...' : registering ? 'Register' : 'Login'}
                    </button>
                </form>
                <div className="flex flex-row justify-center">
                    <button onClick={switchMode} className="btn-hover">
                        {registering ? 'Already have an account? Log in instead.' : 'Create an account'}
                    </button>
                </div>
            </div>
        </AppScreen>
    )
}