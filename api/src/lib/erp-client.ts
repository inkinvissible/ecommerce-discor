import axios from "axios";
import { erpLogger, logApiCall, logError } from "./logger";

const erpClient = axios.create({
    baseURL: process.env.API_BASE_URL,
    headers: {
        'Accept': 'application/json',
    },
    timeout: 60000,
    params:{
        token: process.env.API_TOKEN
    }
});

// Interceptor para logging de requests
erpClient.interceptors.request.use(
    (config) => {
        erpLogger.debug({
            url: config.url,
            method: config.method?.toUpperCase(),
            baseURL: config.baseURL
        }, 'ERP API Request');
        return config;
    },
    (error) => {
        logError(error, { context: 'ERP Request Interceptor' });
        return Promise.reject(error);
    }
);

// Interceptor para logging de responses
erpClient.interceptors.response.use(
    (response) => {
        logApiCall(
            response.config.url || 'unknown',
            response.config.method?.toUpperCase() || 'unknown',
            response.status,
            undefined // duration se puede calcular si es necesario
        );
        return response;
    },
    (error) => {
        const url = error.config?.url || 'unknown';
        const method = error.config?.method?.toUpperCase() || 'unknown';
        const statusCode = error.response?.status;

        logApiCall(url, method, statusCode, undefined, error);
        return Promise.reject(error);
    }
);

export const fetchErpProducts = async () => {
    try {
        const startTime = Date.now();
        const response = await erpClient.get('/ArticulosDB');
        const duration = Date.now() - startTime;

        erpLogger.info({
            productsCount: response.data?.length || 0,
            duration: `${duration}ms`
        }, 'Products fetched successfully from ERP');

        // Log de muestra (solo los primeros productos para debug)
        if (response.data?.length > 0) {
            erpLogger.debug({
                sampleProducts: response.data.slice(0, 2)
            }, 'Sample products from ERP');
        }

        return response.data;
    } catch (error) {
        logError(error as Error, {
            context: 'fetchErpProducts',
            endpoint: '/ArticulosDB'
        });
        throw error;
    }
}

export const fetchErpClients = async () => {
    try {
        const startTime = Date.now();
        const response = await erpClient.get('/ClientesDB');
        const duration = Date.now() - startTime;

        erpLogger.info({
            clientsCount: response.data?.response?.clientes?.length || 0, // Contar clientes
            duration: `${duration}ms`
        }, 'Clients fetched successfully from ERP');

        // Log de muestra (solo los primeros productos para debug)
        if (response.data?.response?.clientes?.length > 0) {
            erpLogger.debug({
                sampleClients: response.data.response.clientes.slice(0, 2) // Log de clientes
            }, 'Sample clients from ERP');
        }

        return response.data;
    } catch (error) {
        logError(error as Error, {
            context: 'fetchErpClients',
            endpoint: '/ClientesDB'
        });
        throw error;
    }
}