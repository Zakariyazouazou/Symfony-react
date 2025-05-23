import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import api from '@/api/axios';
import { orderApi } from '@/api/orderApi';
import { useCart } from './CartContext';
// import axios from 'axios';


type Role = 'user' | 'admin' | null;

interface AuthContextType {
    isAuthenticated: boolean;
    role: Role;
    userName: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, first_name: string, last_name: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    token: string | null;
    RefrachisLoading: boolean,
    userId: number | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [role, setRole] = useState<Role>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [RefrachisLoading, setRefrachIsLoading] = useState(true);
    const [userId, setUserId] = useState<number | null>(null);
    const login = async (email: string, password: string) => {
        const { data } = await authApi.login({ email, password });

        const token = data.token;


        const isAdmin = data.roles.includes('ROLE_ADMIN');
        const refreshedRole: Role = isAdmin ? 'admin' : 'user';
        setRole(refreshedRole);
        setIsAuthenticated(true);
        setUserName(email);

        setToken(token);
        // accessToken is set as cookie + in‐memory; interceptor will attach it
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    };

    const register = async (email: string, first_name: string, last_name: string, password: string) => {
        try {
            await authApi.register({ email, first_name, last_name, password });
            window.location.href = '/login'
        } catch (e: any) {
            const msg = e.response?.data?.message || 'Registration failed';
            // console.error("the error happend here" , e);
            throw new Error(msg);
        }
    };


    const logout = async () => {
        await authApi.logout();
        setIsAuthenticated(false);
        setRole(null);
        setUserName(null);
        window.location.href = '/';
    };

    // Try to refresh token on mount if no token
    useEffect(() => {
        if (!token) {
            authApi.refresh()
                .then(({ data }) => {
                    const refreshedToken = data.token;
                    const isAdmin = data.user.roles.includes('ROLE_ADMIN');
                    const refreshedRole: Role = isAdmin ? 'admin' : 'user';
                    setRole(refreshedRole);
                    setToken(refreshedToken);
                    setIsAuthenticated(true);
                    setUserName(data.user.username);
                    setUserId(data.user.id);
                    console.log("this is the user id ", data.user.id);
                    api.defaults.headers.common['Authorization'] = `Bearer ${refreshedToken}`;
                    // console.log("this is the firs refrch ", refreshedToken);
                })
                .catch((error) => {
                    // console.log("error herr she neeed to be false here ", error);
                    setToken(null);
                    setIsAuthenticated(false);
                    console.error('Failed to refresh token:', error);
                })
                .finally(() => {
                    setRefrachIsLoading(false);
                });;

        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated, role, RefrachisLoading,
                userName, login, register, logout, token, userId
            }}
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
