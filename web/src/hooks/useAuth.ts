import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { LoginCredentials, User } from '@/types/auth';
import {AxiosError} from "axios";

const setCookie = (name: string, value: string, days: number = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=lax`;
};

const removeCookie = (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');

            if (storedToken) {
                try {
                    const userProfile = await authService.getProfile();
                    setUser(userProfile);
                    setToken(storedToken);
                    setIsAuthenticated(true);
                    setCookie('token', storedToken);
                } catch (error) {
                    console.error('Error al obtener el perfil del usuario:', error);
                    // Token inválido, limpiar datos
                    localStorage.removeItem('token');
                    removeCookie('token');
                    setToken(null);
                    setUser(null);
                    setIsAuthenticated(false);
                }
            }

            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            setIsLoading(true);
            const response = await authService.login(credentials);

            localStorage.setItem('token', response.token);
            setCookie('token', response.token);

            setToken(response.token);
            setUser(response.user);
            setIsAuthenticated(true);

            router.push('/dashboard');

            return { success: true };
        } catch (error: unknown) {
            let errorMessage = 'Error al iniciar sesión';
            if (error instanceof AxiosError) {
                errorMessage = error.response?.data?.message || errorMessage;
            }
            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setIsLoading(false);
        }
    };

    const logout =  () => {
            localStorage.removeItem('token');
            removeCookie('token');
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
            router.push('/login');
    };



    return {
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,

    };
};