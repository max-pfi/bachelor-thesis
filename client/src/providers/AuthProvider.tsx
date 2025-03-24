
import React, { createContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

type AuthState = {
    jwt: string | null;
    checkingSession: boolean;
    loading: boolean;
    error: string | null;
}

type AuthContextType = {
    authState: AuthState;
    login: (username: string, password: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider(props: { children: React.ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>({
        jwt: null,
        checkingSession: true,
        loading: false,
        error: null
    });
    const navigate = useNavigate();
    const location = useLocation();

    // check session on initial load
    // the jwt is stored in an http only cookie but cant be accessed from js
    // a request is sent to the server and if the cookie is valid the server will provide the jwt to store in memory
    useEffect(() => {
        const checkSession = async () => {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            navigate('/login');
            await new Promise((resolve) => setTimeout(resolve, 200));
            setAuthState({
                jwt: null,
                checkingSession: false,
                loading: false,
                error: null
            });
        }
        checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Route guard
    useEffect(() => {
        if(authState.jwt === null && !authState.checkingSession && location.pathname !== '/login') {
            console.log('redirecting to login');
            navigate('/login');
        }
    }, [location, authState, navigate])

    // login and redirect to home or set error
    const login = async (username: string, password: string) => {
        setAuthState({
            jwt: null,
            checkingSession: false,
            loading: true,
            error: null
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setAuthState({
            jwt: 'fake-jwt',
            checkingSession: false,
            loading: false,
            error: null
        });
        navigate('/');
    }

    const logout = () => {
        setAuthState({
            jwt: null,
            checkingSession: false,
            loading: false,
            error: null
        });
    }

    return (
        <AuthContext.Provider value={{ authState, login, logout }}>
            {props.children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('auth context used outside of provider');
    }
    return context;
}