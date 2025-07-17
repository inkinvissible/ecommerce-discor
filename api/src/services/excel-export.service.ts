// src/services/excel-export.service.ts
import * as XLSX from 'xlsx';
import { ProductExportData } from './product-export.service';

export class ExcelExportService {
    static generateProductsExcel(products: ProductExportData[]): Buffer {
        try {
            // Crear workbook y worksheet
            const workbook = XLSX.utils.book_new();

            // Mapear datos para el formato correcto
            const worksheetData = products.map(product => ({
                'Codigo': product.sku || '',
                'Nombre': product.name,
                'Descripcion': product.description || '',
                'Marca': product.brand,
                'Categoria': product.category,
                'Precio Lista': product.listPrice,
                'Precio Cliente': product.clientPrice,
                'Descuento %': product.discountPercentage,
                'Activo': product.isActive ? 'Sí' : 'No'
            }));

            // Crear worksheet desde los datos
            const worksheet = XLSX.utils.json_to_sheet(worksheetData);

            // Configurar ancho de columnas
            const columnWidths = [
                { wch: 15 }, // SKU
                { wch: 30 }, // Nombre
                { wch: 40 }, // Descripción
                { wch: 20 }, // Marca
                { wch: 20 }, // Categoría
                { wch: 15 }, // Precio Lista
                { wch: 15 }, // Precio Cliente
                { wch: 12 }, // Descuento %
                { wch: 10 }, // Stock
                { wch: 10 }  // Activo
            ];

            worksheet['!cols'] = columnWidths;

            // Agregar worksheet al workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');

            // Generar buffer
            const buffer = XLSX.write(workbook, {
                type: 'buffer',
                bookType: 'xlsx',
                compression: true
            });

            return buffer;
        } catch (error) {
            console.error('Error generando archivo Excel:', error);
            throw new Error('Error al generar archivo Excel');
        }
    }

    static generateFileName(): string {
        const now = new Date();
        const dateString = now.toISOString().split('T')[0];
        const timeString = now.toTimeString().split(' ')[0].replace(/:/g, '');
        return `productos_${dateString}_${timeString}.xlsx`;
    }
}