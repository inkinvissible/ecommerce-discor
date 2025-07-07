// api/src/schemas/erp.schemas.ts
import { z } from 'zod';

const erpClientSchema = z.object({
    // --- Campos Indispensables ---
    C2_CODI: z.string().min(1, 'El código de cliente no puede estar vacío'),
    C2_DESC: z.string().min(1, 'La razón social no puede estar vacía'),

    // CORREGIDO: Permite un CUIT válido de 11 dígitos O un string vacío.
    // .optional() lo hace tolerante a que la etiqueta <C2_CUIT> ni siquiera exista.
    C2_CUIT: z.string()
        .regex(/^\d{11}$/, 'CUIT inválido. Debe tener 11 dígitos.')
        .or(z.literal('')) // Permite un string vacío
        .optional(),      // Permite que el campo no exista

    // Si el campo correcto es C2_TIPP, simplemente renómbralo.
    C2_TIPP: z.coerce.number().int().nonnegative('La lista de precios no puede ser negativa'),

    // --- Campos de Contacto y Dirección (ya estaban bien con .optional()) ---
    C2_EMAI: z.string().email('Email principal inválido').or(z.literal('')).optional(),
    C2_DIRE: z.string().optional(),
    C2_LOCA: z.string().optional(),
    C2_PROV: z.string().optional(),
    C2_CODP: z.string().optional(),
    C2_TELE: z.string().optional(),

    // --- Campos de Estado (más robusto) ---
    // MEJORADO: Si el campo INACTIVO no viene, por defecto es 'N' (no inactivo).
    INACTIVO: z.enum(['S', 'N'])
        .optional()
        .default('N') // Si el campo es undefined, se asume 'N'
        .transform(value => value === 'S'),

    // --- Campos de Reglas de Negocio ---
    C2_ZONA: z.string().optional(),

}).strip();

// --- Esquema para la RESPUESTA COMPLETA de la API de Clientes ---
export const erpClientsApiResponseSchema = z.object({
    response: z.object({
        clientes: z.array(erpClientSchema),
        error: z.string(),
    })
});

export type ErpClient = z.infer<typeof erpClientSchema>;


const messyStringToNumber = z.string().transform((val) => {
    if (!val) return 0;
    const cleanVal = val.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleanVal) || 0;
});

// Transforma 'S'/'N' a booleano true/false.
const stringToBoolean = z.enum(['S', 'N', '']).optional().transform(val => val === 'S');

// Extrae el nombre de archivo de una ruta de Windows/Linux (ej: "M:\...\1000000.jpg" -> "1000000.jpg")
const extractFilename = z.string().transform(path => {
    if (!path) return null;
    // Divide por barra invertida (\\) o barra normal (/) y toma el último elemento
    return path.split(/[\\/]/).pop() || null;
}).optional();


// --- ESQUEMA PARA UN SOLO ARTÍCULO DEL ERP ---
export const erpProductSchema = z.object({
    // --- Identificadores Core ---
    c1_codi: z.string().min(1, 'El código de artículo no puede estar vacío'), // -> Product.erpCode
    c1_desc: z.string().min(1, 'La descripción no puede estar vacía'), // -> Product.name

    // --- Relaciones (extraemos los NOMBRES, el script se encargará de los IDs) ---
    descmarc: z.string().optional(), // -> ProductBrand.name
    c1_desg: z.string().optional(), // -> Category.name

    // --- Stock (usando el transformador) ---
    c1_stoc: messyStringToNumber.transform(val => Math.round(val)), // -> StockLevel.quantity. Lo redondeamos a entero.

    // --- Precios (cada 'pre' es para una lista de precios distinta) ---
    // Mapearemos c1_pre1 a la lista 1, c1_pre2 a la 2, etc.
    c1_pre1: messyStringToNumber, // -> Price.price para priceListId: 1
    c1_pre2: messyStringToNumber, // -> Price.price para priceListId: 2
    c1_pre3: messyStringToNumber, // -> Price.price para priceListId: 3
    // ... puedes añadir más si los necesitas

    // --- Visibilidad y Estado ---
    exportableweb: stringToBoolean, // Determina si el producto está "activo" en la web

    // --- Datos Adicionales ---
    c1_foto: extractFilename, // Extraemos solo el nombre del archivo de la ruta

}).strip();


// --- Esquema para la RESPUESTA COMPLETA de la API de Artículos ---
export const erpProductsApiResponseSchema = z.object({
    response: z.object({
        // El nombre del array podría ser 'articulos', 'productos', etc. Ajústalo si es necesario.
        articulos: z.array(erpProductSchema)
    })
});

// Extraemos el tipo inferido para tener autocompletado en el script de sync.
export type ErpProduct = z.infer<typeof erpProductSchema>;