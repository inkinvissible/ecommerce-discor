// src/services/configurationService.ts
import { apiClient } from '@/lib/api/client';
import { ConfigurationSettings, VatSettingResponse, MarkupResponse } from '@/types/configuration';

export const configurationService = {
    // Obtener configuración actual
    async getConfiguration(): Promise<ConfigurationSettings> {
        return await apiClient.get('/api/configuration/pricing-config');
    },

    // Actualizar configuración de IVA
    async updateVatSetting(hasVat: boolean): Promise<VatSettingResponse> {
        return await apiClient.patch('/api/configuration/vat-setting', { hasVat });
    },

    // Actualizar porcentaje de markup
    async updateMarkupPercentage(markupPercentage: number): Promise<MarkupResponse> {
        return await apiClient.patch('/api/configuration/markup-percentage', { markupPercentage });
    }
};