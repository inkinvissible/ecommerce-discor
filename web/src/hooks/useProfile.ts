// src/hooks/useProfile.ts
import useSWR from 'swr';
import { Profile } from '@/types/profile';
import { profileService } from '@/services/profileService';

export const useProfile = () => {
    const { data, error, isLoading, mutate } = useSWR<Profile>(
        '/api/profile',
        profileService.getProfile
    );

    return {
        profile: data,
        isLoading,
        isError: error,
        mutate,
        refetch: () => mutate(),
    };
};