// src/app/(dashboard)/(user)/settings/page.tsx
'use client';

import { useConfiguration } from '@/hooks/useConfiguration';
import { VatSettings } from '@/components/layout/Configuration/VatSettings';
import { MarkupSettings } from '@/components/layout/Configuration/MarkupSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Settings } from 'lucide-react';

const SettingsPage = () => {
    const { configuration, isLoading, isError, updateVatSetting, updateMarkupPercentage } = useConfiguration();

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
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
                        Error al cargar la configuración. Intenta nuevamente.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!configuration) {
        return (
            <div className="container mx-auto p-6">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        No se encontró información de configuración.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Settings className="h-8 w-8" />
                    Configuración
                </h1>
                <p className="text-gray-600">
                    Administra las configuraciones de tu tienda
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VatSettings
                    currentValue={configuration.hasVat}
                    onUpdate={updateVatSetting}
                />
                <MarkupSettings
                    currentValue={configuration.markupPercentage}
                    onUpdate={updateMarkupPercentage}
                />
            </div>
        </div>
    );
};

export default SettingsPage;