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
            <div className="login-container">
                <form onSubmit={handleSubmit}>
                    <h1>{registering ? "Register" : "Login"}</h1>
                    {authState.error && <div className="error-box">{authState.error}</div>}
                    <input type="text" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <input type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="submit">
                        {authState.loading ? 'loading...' : registering ? 'Register' : 'Login'}
                    </button>
                </form>
                <div className="register-toggle-container">
                    <button onClick={switchMode} className="register-toggle">
                        {registering ? 'Already have an account? Log in instead.' : 'Create an account'}
                    </button>
                </div>
            </div>
        </AppScreen>
    )
}