import { apiClient } from '@/lib/api/client';
import { Profile } from '@/types/profile';

export const profileService = {
    // Obtener el perfil del usuario
    async getProfile(): Promise<Profile> {
        return await apiClient.get('/api/profile');
    },
};