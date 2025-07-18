// api/src/services/auth.service.ts
import {prisma} from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {z} from 'zod';

// Schema para validar el input del login
export const loginSchema = z.object({
    username: z.string().min(1, 'El nombre de usuario es requerido'),
    password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginInput = z.infer<typeof loginSchema>;

// Error personalizado para el servicio
class AuthServiceError extends Error {
    public statusCode: number;

    constructor(message: string, statusCode: number = 400) {
        super(message);
        this.name = 'AuthServiceError';
        this.statusCode = statusCode;
    }
}

/**
 * Autentica a un usuario y devuelve un token JWT.
 * @param input - Objeto con username y password.
 * @returns El token JWT.
 * @throws {AuthServiceError} Si la autenticación falla.
 */
export async function loginUser(input: LoginInput): Promise<string> {
    // 1. Buscar al usuario por su username.
    // Incluimos el 'client' para tener el clientId disponible para el token.
    const user = await prisma.user.findUnique({
        where: { username: input.username },
        include: {
            client: {
                select: { id: true, deletedAt: true },
            },
        },
    });

    // 2. Verificar si el usuario o su cliente asociado existen y no están desactivados.
    if (!user || user.deletedAt || user.client.deletedAt) {
        throw new AuthServiceError('Credenciales inválidas', 401);
    }

    // 3. Verificar la contraseña.
    const isPasswordCorrect = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordCorrect) {
        throw new AuthServiceError('Credenciales inválidas', 401);
    }

    // 4. Preparar el payload para el token JWT.
    const tokenPayload = {
        userId: user.id,
        clientId: user.clientId, // ¡Medida de seguridad clave!
        username: user.username,
        // Podríamos añadir roles si los tuviéramos: roles: user.roles.map(r => r.role.name)
    };

    // 5. Obtener el secreto del JWT de las variables de entorno.
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error("FATAL: JWT_SECRET no está definido en las variables de entorno.");
        throw new AuthServiceError('Error de configuración del servidor', 500);
    }

    // 6. Generar y firmar el token.
    return jwt.sign(tokenPayload, jwtSecret, {
        expiresIn: '7d', // El token expirará en 7 días.
    });
}