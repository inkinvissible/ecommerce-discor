import axios from "axios";

const erpClient = axios.create({
    baseURL: process.env.API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
});

export const fetchErpProducts = async () => {
    const response = await erpClient.get('/ArticulosDB');
    console.log(response.data.slice(1, 2));
    return response.data;
}