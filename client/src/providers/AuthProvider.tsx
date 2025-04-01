
import React, { createContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { SERVER_URL } from '../data/const';

export type AuthState = {
    jwt: string | null;
    username: string | null;
    id: number | null;
    checkingSession: boolean;
    error: string | null;
    loading: boolean;
}

type AuthContextType = {
    authState: AuthState;
    login: (username: string, password: string) => void;
    logout: () => void;
    register: (username: string, password: string) => void;
    removeError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider(props: { children: React.ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>({
        jwt: null,
        checkingSession: true,
        id: null,
        username: null,
        error: null,
        loading: false,
    });
    const navigate = useNavigate();
    const location = useLocation();
    const locationRef = React.useRef(location.pathname);

    // check session on initial load
    // the jwt is stored in an http only cookie but cant be accessed from js
    // a request is sent to the server and if the cookie is valid the server will provide the jwt to store in memory
    useEffect(() => {
        const checkSession = async () => {
            console.log('checking session');
            fetch(`${SERVER_URL}/auth/session`, {
                method: 'POST',
                credentials: 'include',
            }).then(async (res) => {
                if (res.ok) {
                    handleSuccessfulLogin(res);
                } else {
                    throw new Error('not logged in');
                }
            }).catch(async () => {
                console.log('not logged in');
                navigate('/login');
                await new Promise((resolve) => setTimeout(resolve, 200)); // wait for redirect
                setAuthState(prev => ({ ...prev, checkingSession: false }));
            });
        }
        checkSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Route guard
    useEffect(() => {
        // remove error message when navigating
        if(authState.error && location.pathname !== locationRef.current) {
            setAuthState(prev => ({ ...prev, error: null }));
            locationRef.current = location.pathname;
        }
        if (authState.jwt === null && !authState.checkingSession && location.pathname !== '/login') {
            console.log('redirecting to login');
            navigate('/login');
        }
    }, [location, authState, navigate])

    // login and redirect to home or set error
    const login = async (username: string, password: string) => {
        setAuthState(prev => ({ ...prev, loading: true }));
        fetch(`${SERVER_URL}/auth/login`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        }).then(async (res) => {
            if (res.ok) {
                await handleSuccessfulLogin(res);
                navigate('/');
            } else {
                setAuthState(prev => ({ ...prev, error: 'Password or username incorrect.', loading: false }));
            }
        }).catch(async () => {
            setAuthState(prev => ({ ...prev, error: 'Login failed, please try again.', loading: false }));
        });
    }

    const register = async (username: string, password: string) =>  {
        setAuthState(prev => ({ ...prev, loading: true }));
        fetch(`${SERVER_URL}/auth/register`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        }).then(async (res) => {
            console.log(res);
            if (res.ok) {
                await handleSuccessfulLogin(res);
                navigate('/');
            } else if (res.status === 409) {
                setAuthState(prev => ({ ...prev, error: 'Username already taken.', loading: false }));
            } else {
                throw new Error('failed to register');
            }
        }).catch(async () => {
            setAuthState(prev => ({ ...prev, error: 'Registration failed, please try again.', loading: false }));
        });
    }

    const logout = () => {
        fetch(`${SERVER_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        }).then(() => {
            setAuthState({
                jwt: null,
                id: null,
                username: null,
                checkingSession: false,
                error: null,
                loading: false,
            });
            navigate('/login');
        });
    }

    const handleSuccessfulLogin = async (res: Response) => {
        const { id, username, token } = await res.json() as { id: number, username: string, token: string };
        setAuthState({
            jwt: token,
            id,
            username,
            checkingSession: false,
            error: null,
            loading: false,
        });
    }

    const removeError = () => {
        setAuthState(prev => ({ ...prev, error: null }));
    }

    return (
        <AuthContext.Provider value={{ authState, login, logout, register, removeError }}>
            {props.children}
        </AuthContext.Provider>
    )
}


// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('auth context used outside of provider');
    }
    return context;
}