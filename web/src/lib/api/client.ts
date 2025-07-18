// src/lib/api/client.ts
import axios, { type InternalAxiosRequestConfig, AxiosHeaders } from 'axios';

const baseURL = typeof window === 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL_SERVER
    : process.env.NEXT_PUBLIC_API_URL_CLIENT;

export const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');

            if (token) {
                if (!config.headers) {
                    config.headers = new AxiosHeaders();
                }
                config.headers.set('Authorization', `Bearer ${token}`);
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Cambiar el interceptor de respuestas para devolver solo response.data
apiClient.interceptors.response.use(
    (response) => response.data, // Cambiar aquí - devolver solo los datos
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('authToken');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);