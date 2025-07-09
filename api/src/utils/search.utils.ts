// utils/search.utils.ts

import { AbbreviationsMap, SearchCondition, DbProduct } from '../types/products';

/**
 * Diccionario de abreviaciones comunes
 */
export const ABBREVIATIONS_MAP = {
    // --- Términos Generales y de Componentes ---
    'lc': 'levanta cristal',
    'l/c': 'levanta cristal',
    'cerr': 'cerradura',
    'c/': 'con',
    's/': 'sin',
    'c/cil': 'con cilindro',
    's/mot': 'sin motor',
    'compl': 'completo',
    'ele': 'electrica',
    'elec': 'electrica',
    'elect': 'electrica',
    'jgo': 'juego',
    'man': 'manual',
    'manual': 'manual',
    'm': 'manual', // Usado como 'MAN.' pero truncado
    'mec': 'mecanica',
    'mot': 'motor',
    'm/v': 'modelo viejo',
    'nº': 'numero',
    'nro': 'numero',
    '2p': ' 2 puertas', // Por ej: 2P, 3P
    '3p': ' 3 puertas', // Por ej: 3P, 4P
    '4p': ' 4 puertas', // Por ej: 3P, 4P
    '5p': ' 5 puertas', // Por ej: 5P, 3P
    'pta': 'puerta',
    'ptas': 'puertas',
    'pton': 'porton',
    'rep': 'repuesto',
    'std': 'estandar',

    // --- Posición y Dirección ---
    'ant': 'anterior',
    'd': 'derecha', // Por ej: DEL. D
    'del': 'delantera',
    'der': 'derecha',
    'd/der': 'delantera derecha', // De GACEL/SENDA/GOL D/DER
    'ext': 'exterior',
    'i': 'izquierda', // Por ej: DEL. I
    'inf': 'inferior',
    'int': 'interior',
    'izq': 'izquierda',
    'lat': 'lateral',
    'post': 'posterior',
    'sup': 'superior',
    't': 'trasera', // De "SAND T IZQ"
    'tras': 'trasera',
    'tr': 'trasera', // De "GOL TR/DER"

    // --- Marcas y Modelos de Vehículos ---
    'ch': 'chevrolet',
    'r': 'renault', // Por ej: R-9, R-11, R-19
    'vw': 'volkswagen',
    'sand': 'sandero',
    'sav': 'saveiro',
    'val': 'valeo', // Marca de componentes
    'vale': 'valeo',

    // --- Símbolos y otros ---
    '->': 'en adelante', // Indica "desde el año... en adelante"
    'h/': 'hasta', // Indica "hasta el año..."
};

/**
 * Normaliza texto para búsqueda
 */
export function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .replace(/[^\w\s]/g, ' ') // Convertir puntuación en espacios
        .replace(/\s+/g, ' ') // Múltiples espacios a uno solo
        .trim();
}

/**
 * Expande abreviaciones en el texto
 */
export function expandAbbreviations(text: string): string {
    let expandedText = text;

    Object.entries(ABBREVIATIONS_MAP).forEach(([abbr, full]) => {
        const regex = new RegExp(`\\b${abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        expandedText = expandedText.replace(regex, full);
    });

    return expandedText;
}

/**
 * Genera variantes de búsqueda para mejorar los resultados
 */
export function generateSearchVariants(searchTerm: string): string[] {
    const normalized = normalizeText(searchTerm);
    const expanded = expandAbbreviations(normalized);

    const variants = new Set<string>();

    // Agregar término original normalizado
    variants.add(normalized);

    // Agregar término expandido
    if (expanded !== normalized) {
        variants.add(expanded);
    }

    // Agregar palabras individuales
    const words = expanded.split(' ').filter(word => word.length > 1);
    words.forEach(word => variants.add(word));

    // Agregar combinaciones de 2 palabras consecutivas
    for (let i = 0; i < words.length - 1; i++) {
        variants.add(`${words[i]} ${words[i + 1]}`);
    }

    return Array.from(variants);
}

/**
 * Calcula un score de relevancia para un producto basado en el término de búsqueda
 */
export function calculateRelevanceScore(product: DbProduct, searchTerm: string): number {
    const normalized = normalizeText(searchTerm);
    const expanded = expandAbbreviations(normalized);
    const searchWords = expanded.split(' ').filter(word => word.length > 1);

    // Normalizar y expandir el nombre del producto
    const productName = expandAbbreviations(normalizeText(product.name?.es || ''));
    const productDescription = expandAbbreviations(normalizeText(product.description?.es || ''));
    const productSku = normalizeText(product.sku || '');

    let score = 0;

    // 1. Coincidencia exacta de frase completa (máxima prioridad)
    if (productName.includes(expanded)) {
        score += 150;
    }

    // 2. Coincidencia con todas las palabras en orden
    const allWordsInOrder = searchWords.every((word, i) =>
        productName.includes(word) &&
        (i === 0 || productName.indexOf(word) > productName.indexOf(searchWords[i-1]))
    );

    if (allWordsInOrder) {
        score += 120;
    }

    // 3. Bonus por coincidencia consecutiva de palabras
    let consecutiveBonus = 0;
    let currentConsecutive = 0;

    searchWords.forEach(word => {
        if (productName.includes(word)) {
            currentConsecutive++;
            consecutiveBonus += currentConsecutive * 10; // Bonus acumulativo
        } else {
            currentConsecutive = 0;
        }
    });

    score += consecutiveBonus;

    // 4. Puntuación por palabras individuales
    searchWords.forEach(word => {
        // Coincidencia en nombre (peso alto)
        if (productName.includes(word)) {
            score += 30; // Aumentado de 20 a 30

            // Bonus adicional para términos específicos
            const specificTerms = ['5', 'puerta', 'ptas', 'electrica', 'delantera'];
            if (specificTerms.includes(word)) {
                score += 15;
            }
        }

        // Coincidencia en descripción (peso medio)
        if (productDescription.includes(word)) {
            score += 10;
        }

        // Coincidencia en SKU (peso alto)
        if (productSku.includes(word)) {
            score += 40; // Aumentado de 25 a 40
        }
    });

    // 5. Bonus por cantidad de palabras coincidentes
    const matchedWords = searchWords.filter(word =>
        productName.includes(word) || productDescription.includes(word)
    ).length;

    score += (matchedWords / searchWords.length) * 50; // Aumentado de 30 a 50

    // 6. Bonus por posición temprana de palabras clave
    searchWords.forEach(word => {
        const nameIndex = productName.indexOf(word);
        if (nameIndex !== -1) {
            // Más bonus cuanto más cerca del inicio
            score += Math.max(0, 15 - nameIndex / 10);
        }
    });

    // 7. Penalty reducido por longitud del nombre
    score -= productName.length * 0.05; // Reducido de 0.1 a 0.05

    return score;
}

/**
 * Construye condiciones de búsqueda para Prisma
 */
export function buildSearchConditions(searchTerm: string): SearchCondition[] {
    const variants = generateSearchVariants(searchTerm);
    const conditions: SearchCondition[] = [];

    variants.forEach(variant => {
        // Búsqueda en nombre (JSON path)
        conditions.push({
            name: {
                path: ['es'],
                string_contains: variant,
                mode: 'insensitive'
            }
        });

        // Búsqueda en descripción (JSON path)
        conditions.push({
            description: {
                path: ['es'],
                string_contains: variant,
                mode: 'insensitive'
            }
        });

        // Búsqueda en SKU
        conditions.push({
            sku: {
                contains: variant,
                mode: 'insensitive'
            }
        });
    });

    // Agregar búsqueda por palabras individuales (AND logic)
    const expandedVariant = generateSearchVariants(searchTerm)
        .find(v => v.includes(' '));

    if (expandedVariant) {
        const words = expandedVariant.split(' ').filter(word => word.length > 1);

        if (words.length > 1) {
            const wordConditions: SearchCondition[] = words.map(word => ({
                OR: [
                    {
                        name: {
                            path: ['es'],
                            string_contains: word,
                            mode: 'insensitive'
                        }
                    },
                    {
                        description: {
                            path: ['es'],
                            string_contains: word,
                            mode: 'insensitive'
                        }
                    }
                ]
            }));

            conditions.push({
                AND: wordConditions
            });
        }
    }

    return conditions;
}

/**
 * Procesa parámetros de búsqueda de la URL
 */
export function processSearchParams(searchParam: string | undefined): string | undefined {
    if (!searchParam) return undefined;

    // Decodificar espacios y caracteres especiales
    const decoded = decodeURIComponent(searchParam);

    // Limpiar y normalizar
    return decoded.trim();
}