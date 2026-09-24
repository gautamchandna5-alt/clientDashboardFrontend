import { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { api } from '../api/axios';

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

    // 1. Add a loading state to pause the UI during the refresh check
    const [isLoading, setIsLoading] = useState(true);

    // 2. Automatically ping the backend for a new access token on page load
    useEffect(() => {
        const refreshSession = async () => {
            try {
                // Ensure your backend uses router.get() for the refresh route, or change this to api.post()
                const response = await api.get('/auth/refresh'); 
                const { user, accessToken } = response.data;
                
                setAuthState({ user, accessToken });
            } catch (error) {
                // If it fails (no cookie, expired cookie), they simply remain logged out
                console.log("No active session found.");
            } finally {
                // 3. Un-pause the UI whether the refresh succeeded or failed
                setIsLoading(false);
            }
        };

        refreshSession();
    }, []);

    const setAuth = (user: User, token: string) => {
        setAuthState({ user, accessToken: token });
    };

    const clearAuth = async () => {
        setAuthState({ user: null, accessToken: null });
        
        // Highly recommended: tell the backend to destroy the HttpOnly cookie
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    // 4. Show a loading screen instead of the login screen while checking the session
    if (isLoading) {
        return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading session...</div>;
    }

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