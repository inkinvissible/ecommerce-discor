export interface ConfigurationSettings {
    hasVat: boolean;
    markupPercentage: number;
}

export interface VatSettingResponse {
    message: string;
    hasVat: boolean;
}

export interface MarkupResponse {
    message: string;
    markupPercentage: number;
}

export interface VatSettingRequest {
    hasVat: boolean;
}

export interface MarkupRequest {
    markupPercentage: number;
}