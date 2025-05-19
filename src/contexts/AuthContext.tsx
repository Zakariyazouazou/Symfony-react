// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import api from '@/api/axios';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

type Role = 'user' | 'admin' | null;

interface AuthContextType {
    isAuthenticated: boolean;
    role: Role;
    userName: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [role, setRole] = useState<Role>(null);
    const [userName, setUserName] = useState<string | null>(null);
    // const router = useNavigate();
    const login = async (email: string, password: string) => {
        const { data } = await authApi.login({ email, password });

        const token = data.token;
        const role = data.user.roles.includes('ROLE_ADMIN') ? 'admin' : 'user';


        setIsAuthenticated(true);
        setRole(role);
        setUserName(data.user.username);

        setToken(token);
        // accessToken is set as cookie + in‐memory; interceptor will attach it
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    };

    const register = async (name: string, email: string, password: string) => {
        const { data } = await authApi.register({ name, email, password });
        setIsAuthenticated(true);
        setRole(data.user.role as Role);
        setUserName(data.user.name);
    };

    const logout = async () => {
        await authApi.logout();
        setIsAuthenticated(false);
        setRole(null);
        setUserName(null);
    };



    // useEffect(() => {
    //     const token = localStorage.getItem('token');
    //     if (token) {
    //         api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    //         // Optional: try a refresh here to validate
    //         setIsAuthenticated(true);
    //     }
    // }, []);


    // Try to refresh token on mount
    // useEffect(() => {
    //     if (!token) {
    //         axios
    //             .post("http://symfony-app.zakariyazouazou.com/api/token/refresh", {}, { withCredentials: true })
    //             .then((res) => {
    //                 setToken(res.data.token);
    //             })
    //             .catch(() => {
    //                 setToken(null);
    //                 setIsAuthenticated(false);
    //                 // router("/login"); // or any logout handler
    //             });
    //     }
    // }, [token]);

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, role, userName, login, register, logout, token }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
};
