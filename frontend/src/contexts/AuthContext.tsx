import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

interface User {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
}

interface AuthTokens {
    access: string;
    refresh: string;
}

interface AuthContextType {
    user: User | null;
    tokens: AuthTokens | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string, password2: string) => Promise<void>;
    logout: () => void;
    refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Axios interceptor to add auth header
axios.interceptors.request.use(
    (config) => {
        const tokens = localStorage.getItem('authTokens');
        if (tokens) {
            const { access } = JSON.parse(tokens);
            config.headers.Authorization = `Bearer ${access}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Axios interceptor to handle token refresh
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const tokens = localStorage.getItem('authTokens');
                if (tokens) {
                    const { refresh } = JSON.parse(tokens);
                    const response = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, {
                        refresh
                    });

                    const newTokens = {
                        access: response.data.access,
                        refresh
                    };

                    localStorage.setItem('authTokens', JSON.stringify(newTokens));
                    originalRequest.headers.Authorization = `Bearer ${response.data.access}`;

                    return axios(originalRequest);
                }
            } catch (refreshError) {
                localStorage.removeItem('authTokens');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [tokens, setTokens] = useState<AuthTokens | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load user and tokens from localStorage on mount
        const storedTokens = localStorage.getItem('authTokens');
        const storedUser = localStorage.getItem('user');

        if (storedTokens && storedUser) {
            setTokens(JSON.parse(storedTokens));
            setUser(JSON.parse(storedUser));
        }

        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/login/`, {
                username,
                password
            });

            const { user: userData, tokens: tokenData } = response.data;

            setUser(userData);
            setTokens(tokenData);

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('authTokens', JSON.stringify(tokenData));
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Login failed');
        }
    };

    const register = async (username: string, email: string, password: string, password2: string) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/register/`, {
                username,
                email,
                password,
                password2
            });

            const { user: userData, tokens: tokenData } = response.data;

            setUser(userData);
            setTokens(tokenData);

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('authTokens', JSON.stringify(tokenData));
        } catch (error: any) {
            const errorMsg = error.response?.data;
            if (typeof errorMsg === 'object') {
                const firstError = Object.values(errorMsg)[0];
                throw new Error(Array.isArray(firstError) ? firstError[0] : String(firstError));
            }
            throw new Error('Registration failed');
        }
    };

    const logout = () => {
        setUser(null);
        setTokens(null);
        localStorage.removeItem('user');
        localStorage.removeItem('authTokens');
        localStorage.removeItem('activeDevice');
    };

    const refreshToken = async () => {
        if (!tokens) return;

        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, {
                refresh: tokens.refresh
            });

            const newTokens = {
                access: response.data.access,
                refresh: tokens.refresh
            };

            setTokens(newTokens);
            localStorage.setItem('authTokens', JSON.stringify(newTokens));
        } catch (error) {
            logout();
        }
    };

    const value = {
        user,
        tokens,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshToken
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export { API_BASE_URL };
