// src/hooks/useConfiguration.ts
import useSWR from 'swr';
import { ConfigurationSettings } from '@/types/configuration';
import { configurationService } from '@/services/configurationService';

export const useConfiguration = () => {
    const { data, error, isLoading, mutate } = useSWR<ConfigurationSettings>(
        '/api/configuration',
        configurationService.getConfiguration
    );

    return {
        configuration: data,
        isLoading,
        isError: error,
        mutate,

        // Actualizar configuración de IVA
        updateVatSetting: async (hasVat: boolean) => {
            try {
                const response = await configurationService.updateVatSetting(hasVat);

                // Actualizar cache optimísticamente
                mutate(
                    (current) => current ? { ...current, hasVat: response.hasVat } : undefined,
                    false
                );

                return response;
            } catch (error) {
                throw error;
            }
        },

        // Actualizar porcentaje de markup
        updateMarkupPercentage: async (markupPercentage: number) => {
            try {
                const response = await configurationService.updateMarkupPercentage(markupPercentage);

                // Actualizar cache optimísticamente
                mutate(
                    (current) => current ? { ...current, markupPercentage: response.markupPercentage } : undefined,
                    false
                );

                return response;
            } catch (error) {
                throw error;
            }
        }
    };
};