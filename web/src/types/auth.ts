// src/types/auth.ts
export interface LoginCredentials {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: {
        id: string;
        username: string;
        name: string;
        role: string;
    };
}

export interface User {
    id: string;
    name: string;
    role: string;
    avatar?: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}