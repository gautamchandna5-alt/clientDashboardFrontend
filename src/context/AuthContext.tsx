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

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const refreshSession = async () => {
            try {
                // Adjust to api.post('/auth/refresh') if your backend uses POST instead of GET
                const response = await api.post('/auth/refresh'); 
                const { user, accessToken } = response.data;
                
                // Inject token into Axios headers for all future requests
                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                
                setAuthState({ user, accessToken });
            } catch (error) {
                console.log("No active session found.");
                delete api.defaults.headers.common['Authorization'];
            } finally {
                setIsLoading(false);
            }
        };

        refreshSession();
    }, []);

    const setAuth = (user: User, token: string) => {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setAuthState({ user, accessToken: token });
    };

    const clearAuth = async () => {
        delete api.defaults.headers.common['Authorization'];
        setAuthState({ user: null, accessToken: null });
        
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

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