import { createContext, useState, useContext, type ReactNode } from 'react';

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
}

interface AuthContextType extends AuthState {
    setAuth: (user: User, token: string) => void;
    clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [auth, setAuthState] = useState<AuthState>({
        user: null,
        accessToken: null,
    });

    const setAuth = (user: User, token: string) => {
        setAuthState({ user, accessToken: token });
    };

    const clearAuth = () => {
        setAuthState({ user: null, accessToken: null });
    };

    return (
        <AuthContext.Provider value={{ ...auth, setAuth, clearAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};