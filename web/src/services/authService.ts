// src/services/authService.ts
import { apiClient } from '@/lib/api/client';
import { LoginCredentials, LoginResponse, User } from '@/types/auth';

export const authService = {
    // Login de usuario
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        return await apiClient.post('/api/auth/login', credentials);
    },


    // Obtener perfil del usuario actual
    getProfile: async (): Promise<User> => {
        return await apiClient.get('/api/auth/me');
    },

};