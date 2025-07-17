// src/app/(dashboard)/(user)/profile/page.tsx
'use client';

import { useProfile } from '@/hooks/useProfile';
import { ClientInfo } from '@/components/layout/Profile/ClientInfo';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const ProfilePage = () => {
    const { profile, isLoading, isError } = useProfile();

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container mx-auto p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Error al cargar la información del perfil. Intenta nuevamente.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container mx-auto p-6">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        No se encontró información del perfil.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Mi Perfil</h1>
                <p className="text-gray-600">Administra tu información personal y configuraciones</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ClientInfo client={profile.client} />
            </div>
        </div>
    );
};

export default ProfilePage;