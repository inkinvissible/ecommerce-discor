// src/controllers/product-export.controller.ts
import { Request, Response } from 'express';
import { getProductsForExport } from '../services/product-export.service';
import { ExcelExportService } from '../services/excel-export.service';
import { ProductServiceError } from '../types/products';

interface AuthenticatedRequest extends Request {
    user?: {
        clientId: string;
        userId: string;
        username: string;
    };
}

export async function exportProductsToExcel(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
        const clientId = req.user?.clientId;

        if (!clientId) {
            res.status(403).json({
                error: 'No tiene permisos para esta operación'
            });
            return;
        }

        console.log(`Iniciando exportación de productos para cliente: ${clientId}`);

        // Obtener productos para exportación
        const products = await getProductsForExport(clientId);

        if (products.length === 0) {
            res.status(404).json({
                message: 'No se encontraron productos para exportar'
            });
            return;
        }

        console.log(`Generando Excel para ${products.length} productos`);

        // Generar archivo Excel
        const excelBuffer = ExcelExportService.generateProductsExcel(products);
        const fileName = ExcelExportService.generateFileName();

        // Configurar headers de respuesta
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', excelBuffer.length);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // Enviar archivo
        res.send(excelBuffer);

        console.log(`Exportación completada exitosamente: ${fileName}`);

    } catch (error) {
        console.error('Error al exportar productos:', error);

        if (error instanceof ProductServiceError) {
            res.status(error.statusCode).json({
                error: error.message
            });
        } else {
            res.status(500).json({
                error: 'Error interno del servidor al exportar productos'
            });
        }
    }
}