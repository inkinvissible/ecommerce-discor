import {apiClient} from './client';

/**
 * Fetcher genérico para ser usado por SWR.
 * Utiliza nuestra instancia de apiClient para hacer la petición GET.
 * @param url La URL del endpoint de la API a la que se hará la petición.
 * @returns La propiedad `data` de la respuesta de Axios.
 */
export const fetcher = (url: string) => apiClient.get(url).then(res => res.data);