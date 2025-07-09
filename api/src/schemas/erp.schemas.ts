// api/src/schemas/erp.schemas.ts
import { z } from 'zod';

const erpClientSchema = z.object({
    // --- Campos Indispensables (los mantenemos requeridos) ---
    C2_CODI: z.string().min(1, 'El código de cliente no puede estar vacío'),
    C2_DESC: z.string().min(1, 'La razón social no puede estar vacía'),

    // --- CUIT (AHORA MÁS ROBUSTO) ---
    C2_CUIT: z.string().optional().transform((cuit) => {
        if (!cuit) return ''; // Si es null, undefined o '', devuelve ''
        const cleanedCuit = cuit.replace(/[^0-9]/g, ''); // Elimina todo lo que no sea número
        return cleanedCuit.length === 11 ? cleanedCuit : ''; // Solo devuelve el CUIT si tiene 11 dígitos
    }),

    // --- Lista de Precios ---
    C2_TIPP: z.coerce.number().int().nonnegative('La lista de precios no puede ser negativa'),

    // --- Descuento (AHORA PROCESA PORCENTAJES) ---
    C2_DTOE: z.string().optional().transform((discount) => {
        if (!discount) return 0; // Si es null, undefined o '', devuelve 0

        // Limpiar el string: eliminar espacios, comas, y el símbolo %
        const cleanedDiscount = discount.replace(/[^\d.,]/g, '');

        // Reemplazar coma por punto para decimales
        const normalizedDiscount = cleanedDiscount.replace(',', '.');

        // Convertir a número
        const numericValue = parseFloat(normalizedDiscount);

        // Verificar que sea un número válido
        if (isNaN(numericValue)) return 0;

        // Si el valor original contenía %, asumir que ya está en formato porcentual
        // Si es mayor a 100, probablemente está mal formateado, así que limitarlo
        return Math.min(Math.max(numericValue, 0), 100); // Entre 0 y 100
    }),

    // --- Email (AHORA MÁS ROBUSTO) ---
    C2_EMAI: z.string().optional().transform((email) => {
        if (!email) return '';
        // Una validación simple: si contiene un '@' y no tiene espacios, es suficientemente bueno.
        // z.string().email() es demasiado estricto para datos sucios.
        return email.includes('@') && !email.includes(' ') ? email : '';
    }),

    // --- Campos de Dirección y Contacto (ya estaban bien con .optional()) ---
    C2_DIRE: z.string().optional(),
    C2_LOCA: z.string().optional(),
    C2_PROV: z.string().optional(),
    C2_CODP: z.string().optional(),
    C2_TELE: z.string().optional(),

    // --- Estado INACTIVO (AHORA MÁS ROBUSTO) ---
    INACTIVO: z.enum(['S', 'N', '']) // 1. Permitimos el string vacío
        .optional()
        .default('N') // 2. Si el campo no viene, es 'N'
        .transform(value => value === 'S'), // 3. Transformamos 'S' a true, y 'N' o '' a false

    // --- Campos de Reglas de Negocio ---
    C2_ZONA: z.string().optional(),

}).strip();

// --- Esquema para la RESPUESTA COMPLETA de la API de Clientes ---
export const erpClientsApiResponseSchema = z.object({
    response: z.object({
        clientes: z.array(erpClientSchema),
        // Podríamos hacer el campo error opcional si a veces no viene
        error: z.string().optional(),
    })
});
export type ErpClient = z.infer<typeof erpClientSchema>;


const messyStringToNumber = z.string().transform((val) => {
    if (!val) return 0;
    // 1. Eliminar todas las COMAS (separadores de miles)
    const withoutCommas = val.replace(/,/g, '');

    // 2. Convertir a número flotante directamente
    return parseFloat(withoutCommas) || 0;
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
    c1_desc: z.string().optional(),
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

    // --- Visibilidad y Estado ---
    exportableweb: stringToBoolean, // Determina si el producto está "activo" en la web

    // --- Datos Adicionales ---
    c1_foto: extractFilename, // Extraemos solo el nombre del archivo de la ruta

})
    .strip()
    .transform((data) =>{
        const finalDesc = (data.c1_desc && data.c1_desc.trim() !== '')
            ? data.c1_desc.trim()
            : data.c1_codi; // Fallback al código si la descripción está vacía

        return {
            ...data, // Mantenemos todos los demás campos
            c1_desc: finalDesc, // Sobreescribimos c1_desc con el valor final y limpio
        };
    })


// --- Esquema para la RESPUESTA COMPLETA de la API de Artículos ---
export const erpProductsApiResponseSchema = z.object({
    response: z.object({
        // El nombre del array podría ser 'articulos', 'productos', etc. Ajústalo si es necesario.
        articulos: z.array(erpProductSchema)
    })
});

// Extraemos el tipo inferido para tener autocompletado en el script de sync.
export type ErpProduct = z.infer<typeof erpProductSchema>;

const messyStringToInteger = z.string().transform((val) => {
    if (!val) return 0;
    // Maneja puntos como separadores de miles y comas como decimales, luego redondea.
    const cleanVal = val.replace(/\./g, '').replace(',', '.');
    return Math.round(parseFloat(cleanVal)) || 0;
});

export const erpStockItemSchema = z.object({
    // Asumimos que el JSON usará los mismos nombres que el XML, pero en minúsculas/camelCase.
    // Ajusta si los nombres de las claves en el JSON son diferentes.
    CODIGOARTICULO: z.string().min(1, 'El código de artículo no puede estar vacío'),
    STOCK: messyStringToInteger,
    DEPOSITO: z.string().optional(), // Lo capturamos por si es útil en el futuro, pero no lo usaremos
}).strip();


// --- Esquema para la RESPUESTA COMPLETA de la API de Stock ---
export const erpStockApiResponseSchema = z.object({
    // La respuesta del ERP podría tener una estructura anidada como las otras.
    // Ajusta esto a la estructura real del JSON que recibes.
    // Asumo una estructura similar a la de productos.
    Stock_response: z.object({
        articulos: z.array(erpStockItemSchema),
        error: z.string().optional(),
    }),
});

// Extraemos el tipo inferido para tener autocompletado.
export type ErpStockItem = z.infer<typeof erpStockItemSchema>;

