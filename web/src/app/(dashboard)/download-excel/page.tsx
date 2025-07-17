"use client";
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, Loader2, InfoIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

const ExcelDownloadButton = () => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadExcel = async () => {
        setIsDownloading(true);
        try {
            // Obtener el token del localStorage
            const token = localStorage.getItem('token');

            const baseURL = typeof window === 'undefined'
                ? process.env.NEXT_PUBLIC_API_URL_SERVER
                : process.env.NEXT_PUBLIC_API_URL_CLIENT;

            // Crear una instancia específica para la descarga
            const response = await axios.get(`${baseURL}/api/products/export/excel`, {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    ...(token && { Authorization: `Bearer ${token}` })
                },
            });

            // Crear blob URL y descargar
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `productos_${new Date().toISOString().split('T')[0]}.xlsx`;

            // Añadir al DOM, hacer clic y limpiar
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Excel descargado exitosamente');
        } catch (error) {
            console.error('Error downloading Excel:', error);
            toast.error('Error al descargar el archivo Excel');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Button
            onClick={handleDownloadExcel}
            disabled={isDownloading}
            variant="outline"
            size="sm"
            className="gap-2"
        >
            {isDownloading ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Descargando...
                </>
            ) : (
                <>
                    <Download className="h-4 w-4" />
                    Descargar Excel
                </>
            )}
        </Button>
    );
};

const ProductsExportPage = () => {
    return (
        <div className="container mx-auto py-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <FileSpreadsheet className="h-16 w-16 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Exportar Productos</h1>
                    <p className="text-muted-foreground">
                        Descarga todos los productos en formato Excel
                    </p>
                </div>

                {/* Export Card */}
                <div className="border rounded-lg p-6 bg-card">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold">Archivo Excel</h3>
                            <p className="text-sm text-muted-foreground">
                                Incluye toda la información de productos
                            </p>
                        </div>
                        <FileSpreadsheet className="h-8 w-8 text-green-600" />
                    </div>

                    <div className="flex justify-end">
                        <ExcelDownloadButton />
                    </div>
                </div>

                {/* Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                        <div className="text-blue-600 mt-0.5">
                            <InfoIcon className="mr-2" />
                        </div>
                        <div>
                            <h4 className="font-medium text-blue-900">Información del archivo</h4>
                            <p className="text-sm text-blue-800 mt-1">
                                El archivo Excel incluye todos los productos con sus detalles completos y precios actualizados.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductsExportPage;